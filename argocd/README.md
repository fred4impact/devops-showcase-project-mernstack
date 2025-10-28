# ArgoCD Configuration for TicketNow

This directory contains ArgoCD manifests for GitOps-based deployment of the TicketNow application.

## Structure

```
argocd/
├── namespace.yaml              # ArgoCD namespace
├── ticketnow-project.yaml      # ArgoCD project configuration
├── ticketnow-application.yaml  # Single application deployment
├── app-of-apps.yaml           # App of Apps pattern
├── apps/                      # Environment-specific applications
│   ├── dev-application.yaml   # Development environment
│   ├── staging-application.yaml # Staging environment
│   └── prod-application.yaml  # Production environment
└── kustomization.yaml         # Kustomize configuration
```

## Deployment Patterns

### 1. Single Application
Deploy directly using `ticketnow-application.yaml`:
```bash
kubectl apply -f argocd/ticketnow-application.yaml
```

### 2. App of Apps Pattern (Recommended)
Deploy using the App of Apps pattern for multiple environments:
```bash
kubectl apply -f argocd/app-of-apps.yaml
```

## Environment Configuration

- **Development**: Uses `develop` branch, deploys to `ticketnow-dev` namespace
- **Staging**: Uses `main` branch, deploys to `ticketnow-staging` namespace  
- **Production**: Uses `main` branch, deploys to `ticketnow` namespace

## Prerequisites

1. ArgoCD installed on your Kubernetes cluster
2. Docker images pushed to Docker Hub
3. K8s manifests updated with correct image references
4. Secrets and ConfigMaps configured

## Quick Start

1. Install ArgoCD:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

2. Apply ArgoCD project:
```bash
kubectl apply -f argocd/ticketnow-project.yaml
```

3. Deploy application:
```bash
kubectl apply -f argocd/ticketnow-application.yaml
```

4. Access ArgoCD UI:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Access https://localhost:8080
```

## Configuration

### Image References
Update image references in K8s manifests:
- Replace `YOUR_DOCKER_USERNAME` with your Docker Hub username
- Ensure images are pushed to Docker Hub

### Secrets and ConfigMaps
Configure the following in your K8s manifests:
- Backend secrets (JWT, Stripe, S3, SendGrid)
- Frontend secrets (Stripe publishable key)
- ConfigMaps (database URLs, API endpoints)

### Ingress Configuration
Update ingress hostname in `k8s/ingress.yaml`:
- Replace `ticketnow.local` with your domain
- Configure SSL certificates if needed

## Monitoring

Check application status:
```bash
argocd app get ticketnow-app
argocd app list
```

Check Kubernetes resources:
```bash
kubectl get pods -n ticketnow
kubectl get svc -n ticketnow
kubectl get ingress -n ticketnow
```

## Troubleshooting

Common issues:
1. **ImagePullBackOff**: Verify image exists and is accessible
2. **Sync Issues**: Check ArgoCD logs and application status
3. **Service Issues**: Verify service selectors and endpoints
4. **Ingress Issues**: Check ingress controller and DNS configuration

For detailed troubleshooting, see `k8s_steps_deploy.md`.
