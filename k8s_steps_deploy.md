# Kubernetes Deployment Guide for TicketNow on AWS EKS

This guide provides step-by-step instructions for deploying the TicketNow application on AWS EKS using ArgoCD for GitOps-based continuous deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS EKS Setup](#aws-eks-setup)
3. [ArgoCD Installation](#argocd-installation)
4. [Application Configuration](#application-configuration)
5. [Deployment Process](#deployment-process)
6. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
7. [Scaling and Updates](#scaling-and-updates)

## Prerequisites

### Required Tools
- `kubectl` (v1.21+)
- `aws-cli` (v2.0+)
- `helm` (v3.0+)
- `argocd` CLI
- Docker Hub account with images pushed

### AWS Requirements
- AWS CLI configured with appropriate permissions
- EKS cluster running (v1.21+)
- Load balancer controller installed
- Ingress controller (NGINX) installed

### GitHub Repository
- Repository: `https://github.com/fred4impact/devops-showcase-project-mernstack`
- Docker images pushed to Docker Hub: `YOUR_USERNAME/ticketnow-backend:latest`, `YOUR_USERNAME/ticketnow-frontend:latest`

## AWS EKS Setup

### 1. Configure kubectl for EKS

```bash
# Update kubeconfig for your EKS cluster
aws eks update-kubeconfig --region us-west-2 --name your-cluster-name

# Verify connection
kubectl get nodes
```

### 2. Install AWS Load Balancer Controller

```bash
# Create IAM policy
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.4/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json

# Create service account
eksctl create iamserviceaccount \
  --cluster=your-cluster-name \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name "AmazonEKSLoadBalancerControllerRole" \
  --attach-policy-arn=arn:aws:iam::YOUR_ACCOUNT_ID:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Install controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=your-cluster-name \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 3. Install NGINX Ingress Controller

```bash
# Add NGINX Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install NGINX Ingress
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"
```

## ArgoCD Installation

### 1. Install ArgoCD

```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
```

### 2. Access ArgoCD UI

```bash
# Port forward to access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo

# Access ArgoCD at https://localhost:8080
# Username: admin
# Password: [from above command]
```

### 3. Install ArgoCD CLI

```bash
# Install ArgoCD CLI
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Login to ArgoCD
argocd login localhost:8080
```

## Application Configuration

### 1. Update Image References

Before deploying, update the image references in your K8s manifests:

```bash
# Replace YOUR_DOCKER_USERNAME with your actual Docker Hub username
sed -i 's/YOUR_DOCKER_USERNAME/your-actual-username/g' k8s/backend-deployment.yaml
sed -i 's/YOUR_DOCKER_USERNAME/your-actual-username/g' k8s/frontend-deployment.yaml
```

### 2. Configure Secrets and ConfigMaps

Update the following files with your actual values:

#### Backend Secrets (`k8s/backend-secrets.yaml`)
```bash
# Generate base64 encoded secrets
echo -n "your-jwt-secret" | base64
echo -n "your-stripe-secret-key" | base64
echo -n "your-stripe-webhook-secret" | base64
echo -n "your-s3-access-key" | base64
echo -n "your-s3-secret-key" | base64
echo -n "your-sendgrid-api-key" | base64
```

#### Frontend Secrets (`k8s/frontend-secrets.yaml`)
```bash
echo -n "your-stripe-publishable-key" | base64
```

#### Backend ConfigMap (`k8s/backend-configmap.yaml`)
Update with your actual values:
- MongoDB URI
- Redis URL
- S3 bucket configuration
- SendGrid email settings
- Frontend base URL

#### Frontend ConfigMap (`k8s/frontend-configmap.yaml`)
Update with your actual values:
- API URL
- App name and URL

### 3. Update Ingress Configuration

Update `k8s/ingress.yaml` with your domain:

```yaml
spec:
  rules:
  - host: your-domain.com  # Replace ticketnow.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ticketnow-frontend-service
            port:
              number: 3000
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: ticketnow-backend-service
            port:
              number: 3001
```

## Deployment Process

### Option 1: Direct ArgoCD Application Deployment

```bash
# Apply ArgoCD project
kubectl apply -f argocd/ticketnow-project.yaml

# Apply single application
kubectl apply -f argocd/ticketnow-application.yaml

# Check application status
argocd app get ticketnow-app
```

### Option 2: App of Apps Pattern (Recommended)

```bash
# Apply ArgoCD project
kubectl apply -f argocd/ticketnow-project.yaml

# Apply App of Apps
kubectl apply -f argocd/app-of-apps.yaml

# Check all applications
argocd app list
```

### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -n ticketnow

# Check services
kubectl get svc -n ticketnow

# Check ingress
kubectl get ingress -n ticketnow

# Get application logs
kubectl logs -f deployment/ticketnow-backend -n ticketnow
kubectl logs -f deployment/ticketnow-frontend -n ticketnow
```

## Monitoring and Troubleshooting

### 1. ArgoCD Application Status

```bash
# Check application sync status
argocd app get ticketnow-app

# Check application health
argocd app health ticketnow-app

# View application logs
argocd app logs ticketnow-app
```

### 2. Kubernetes Resources

```bash
# Check pod status
kubectl get pods -n ticketnow -o wide

# Check pod events
kubectl describe pod <pod-name> -n ticketnow

# Check service endpoints
kubectl get endpoints -n ticketnow

# Check ingress status
kubectl describe ingress ticketnow-ingress -n ticketnow
```

### 3. Common Issues and Solutions

#### Pod ImagePullBackOff
```bash
# Check if image exists
docker pull your-username/ticketnow-backend:latest

# Verify image reference in deployment
kubectl get deployment ticketnow-backend -n ticketnow -o yaml | grep image
```

#### Service Not Accessible
```bash
# Check service endpoints
kubectl get endpoints ticketnow-backend-service -n ticketnow

# Check service selector
kubectl get pods -l app=ticketnow-backend -n ticketnow
```

#### Ingress Issues
```bash
# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Check ingress status
kubectl describe ingress ticketnow-ingress -n ticketnow
```

## Scaling and Updates

### 1. Manual Scaling

```bash
# Scale backend
kubectl scale deployment ticketnow-backend --replicas=3 -n ticketnow

# Scale frontend
kubectl scale deployment ticketnow-frontend --replicas=3 -n ticketnow
```

### 2. Horizontal Pod Autoscaler

Create HPA for automatic scaling:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ticketnow-backend-hpa
  namespace: ticketnow
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ticketnow-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 3. Rolling Updates

ArgoCD automatically handles rolling updates when you push new commits to your repository. The update process:

1. Push new code to GitHub
2. CI/CD pipeline builds new Docker images
3. ArgoCD detects changes and syncs automatically
4. Kubernetes performs rolling update

### 4. Blue-Green Deployment

For zero-downtime deployments, you can implement blue-green deployment:

```bash
# Create blue-green application
kubectl apply -f argocd/apps/blue-green-application.yaml

# Switch traffic between blue and green
argocd app set ticketnow-app --sync-policy automated
```

## Environment-Specific Deployments

### Development Environment
- Uses `develop` branch
- Deployed to `ticketnow-dev` namespace
- Automatic sync enabled

### Staging Environment
- Uses `main` branch
- Deployed to `ticketnow-staging` namespace
- Manual sync for testing

### Production Environment
- Uses `main` branch with specific tags
- Deployed to `ticketnow` namespace
- Manual sync with approval

## Security Best Practices

### 1. RBAC Configuration

```bash
# Create service account for ArgoCD
kubectl create serviceaccount argocd-manager -n argocd

# Create cluster role binding
kubectl create clusterrolebinding argocd-manager-role \
  --clusterrole=cluster-admin \
  --serviceaccount=argocd:argocd-manager
```

### 2. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ticketnow-network-policy
  namespace: ticketnow
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: ticketnow
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: ticketnow
```

### 3. Pod Security Standards

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ticketnow
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Cleanup

### Remove Application
```bash
# Delete ArgoCD application
argocd app delete ticketnow-app

# Delete Kubernetes resources
kubectl delete -k k8s/
```

### Remove ArgoCD
```bash
# Delete ArgoCD
kubectl delete namespace argocd
```

## Next Steps

1. **Monitoring**: Set up Prometheus and Grafana for application monitoring
2. **Logging**: Implement centralized logging with ELK stack
3. **Backup**: Configure database backups and disaster recovery
4. **Security**: Implement network policies and pod security standards
5. **CI/CD**: Enhance pipeline with automated testing and security scanning

## Support

For issues and questions:
- Check ArgoCD documentation: https://argo-cd.readthedocs.io/
- Kubernetes troubleshooting: https://kubernetes.io/docs/tasks/debug-application-cluster/
- AWS EKS documentation: https://docs.aws.amazon.com/eks/

---

**Note**: Replace all placeholder values (YOUR_DOCKER_USERNAME, your-cluster-name, etc.) with your actual values before deployment.
