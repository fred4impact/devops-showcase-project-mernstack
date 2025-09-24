# ArgoCD Deployment Guide for TicketNow

This guide provides step-by-step instructions to deploy the TicketNow MERN stack application using ArgoCD for GitOps continuous delivery.

## What is ArgoCD?

ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It automatically syncs your application deployments based on the state defined in your Git repository.

## Prerequisites

### 1. Kubernetes Cluster
- Kubernetes cluster (v1.19+)
- Ingress controller (nginx recommended)
- Storage class for persistent volumes

### 2. Git Repository
- Your application code in a Git repository
- Repository accessible from your Kubernetes cluster
- Proper permissions for ArgoCD to access the repository

### 3. Required Tools
```bash
# Install ArgoCD CLI
# macOS
brew install argocd

# Linux
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Verify installation
argocd version
```

## ArgoCD Installation

### Method 1: Using ArgoCD Installation Manifest

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
```

### Method 2: Using Our Custom Configuration

```bash
# Apply our custom ArgoCD configuration
kubectl apply -k argocd/

# Check ArgoCD status
kubectl get pods -n argocd
```

## Accessing ArgoCD

### 1. Port Forward (for local access)
```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access ArgoCD UI
# URL: https://localhost:8080
# Username: admin
# Password: (get from secret)
```

### 2. Get Admin Password
```bash
# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo

# Or use our custom password
kubectl -n argocd get secret argocd-secret -o jsonpath="{.data.admin\.password}" | base64 -d && echo
```

### 3. Configure Ingress (Production)
```bash
# Add to /etc/hosts for local testing
echo "127.0.0.1 argocd.local" | sudo tee -a /etc/hosts

# Access via ingress
# URL: https://argocd.local
```

## Deploying TicketNow with ArgoCD

### 1. Update Repository Configuration

Before deploying, update the repository URL in the application manifests:

```bash
# Update repository URL in application.yaml
sed -i 's|https://github.com/your-username/mernstack-devops-showcase-project|https://github.com/YOUR-ACTUAL-USERNAME/mernstack-devops-showcase-project|g' argocd/application.yaml

# Update repository URL in application-set.yaml
sed -i 's|https://github.com/your-username/mernstack-devops-showcase-project|https://github.com/YOUR-ACTUAL-USERNAME/mernstack-devops-showcase-project|g' argocd/application-set.yaml
```

### 2. Deploy ArgoCD Application

```bash
# Apply ArgoCD configuration
kubectl apply -k argocd/

# Check application status
kubectl get applications -n argocd

# Check application details
kubectl describe application ticketnow-app -n argocd
```

### 3. Sync Application

```bash
# Manual sync (if auto-sync is disabled)
argocd app sync ticketnow-app

# Check sync status
argocd app get ticketnow-app

# View application tree
argocd app tree ticketnow-app
```

## ArgoCD CLI Commands

### Authentication
```bash
# Login to ArgoCD
argocd login argocd.local --username admin --password <admin-password>

# Or login via port-forward
argocd login localhost:8080 --username admin --password <admin-password>
```

### Application Management
```bash
# List applications
argocd app list

# Get application details
argocd app get ticketnow-app

# Sync application
argocd app sync ticketnow-app

# Force sync (bypasses sync policy)
argocd app sync ticketnow-app --force

# Hard refresh (reloads from Git)
argocd app get ticketnow-app --hard-refresh

# Delete application
argocd app delete ticketnow-app
```

### Application History and Rollback
```bash
# View application history
argocd app history ticketnow-app

# Rollback to previous version
argocd app rollback ticketnow-app <revision>

# Rollback to specific revision
argocd app rollback ticketnow-app <revision> --dry-run
```

### Application Logs
```bash
# View application logs
argocd app logs ticketnow-app

# View logs for specific component
argocd app logs ticketnow-app --component backend

# Follow logs
argocd app logs ticketnow-app --follow
```

## GitOps Workflow

### 1. Development Workflow
```bash
# 1. Make changes to your application
git add .
git commit -m "Update application configuration"
git push origin main

# 2. ArgoCD automatically detects changes (if auto-sync enabled)
# Or manually sync
argocd app sync ticketnow-app

# 3. Monitor deployment
argocd app get ticketnow-app
```

### 2. Environment Promotion
```bash
# Create environment-specific applications
kubectl apply -f argocd/application-set.yaml

# This creates applications for different environments
# based on values files in argocd/environments/
```

## Monitoring and Troubleshooting

### Check Application Health
```bash
# Get application health status
argocd app get ticketnow-app --health

# Get detailed application info
argocd app get ticketnow-app --output yaml
```

### Check Sync Status
```bash
# Check if application is in sync
argocd app get ticketnow-app --sync

# Force refresh from Git
argocd app get ticketnow-app --refresh
```

### Troubleshooting Commands
```bash
# Check ArgoCD server logs
kubectl logs -f deployment/argocd-server -n argocd

# Check ArgoCD application controller logs
kubectl logs -f deployment/argocd-application-controller -n argocd

# Check ArgoCD repo server logs
kubectl logs -f deployment/argocd-repo-server -n argocd
```

### Application Events
```bash
# View application events
kubectl get events -n ticketnow --sort-by='.lastTimestamp'

# View ArgoCD events
kubectl get events -n argocd --sort-by='.lastTimestamp'
```

## Advanced Configuration

### 1. Multi-Environment Setup
```bash
# Create environment-specific values
mkdir -p argocd/environments/{dev,staging,prod}

# Create values files for each environment
cat > argocd/environments/dev/values.yaml << EOF
replicas:
  backend: 1
  frontend: 1
resources:
  backend:
    requests:
      memory: "256Mi"
      cpu: "100m"
  frontend:
    requests:
      memory: "128Mi"
      cpu: "50m"
EOF
```

### 2. Custom Sync Policies
```yaml
# In application.yaml, customize sync policy
spec:
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### 3. Resource Hooks
```yaml
# Add resource hooks for custom deployment steps
metadata:
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation
```

## Security Best Practices

### 1. RBAC Configuration
```bash
# Create user accounts
argocd account update-password --account <username> --new-password <password>

# Assign roles
argocd proj role create ticketnow-project ticketnow-developer
argocd proj role add-policy ticketnow-project ticketnow-developer --action get --permission allow --resource applications
```

### 2. Repository Access
```bash
# Add repository credentials
argocd repo add https://github.com/your-username/mernstack-devops-showcase-project \
  --username <username> \
  --password <token>
```

### 3. Cluster Access
```bash
# Add external cluster
argocd cluster add <cluster-name> --server <cluster-server-url>
```

## Cleanup

### Remove ArgoCD Application
```bash
# Delete application
argocd app delete ticketnow-app

# Or using kubectl
kubectl delete application ticketnow-app -n argocd
```

### Remove ArgoCD
```bash
# Delete ArgoCD namespace
kubectl delete namespace argocd

# Or using our configuration
kubectl delete -k argocd/
```

## Quick Reference

### Essential Commands
```bash
# Install ArgoCD
kubectl apply -k argocd/

# Login to ArgoCD
argocd login argocd.local --username admin

# Deploy application
kubectl apply -f argocd/application.yaml

# Check status
argocd app get ticketnow-app

# Sync application
argocd app sync ticketnow-app

# View logs
argocd app logs ticketnow-app
```

### Useful Aliases
```bash
# Add to your shell profile
alias argo='argocd'
alias argo-apps='argocd app list'
alias argo-sync='argocd app sync'
alias argo-status='argocd app get'
```

This guide provides everything you need to deploy and manage your TicketNow application using ArgoCD for GitOps continuous delivery!
