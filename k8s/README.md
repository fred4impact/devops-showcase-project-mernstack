# TicketNow Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the TicketNow application.

## Prerequisites

1. Kubernetes cluster (minikube, kind, or cloud provider)
2. kubectl configured to access your cluster
3. Docker images built and available:
   - `ticketnow-backend:latest`
   - `ticketnow-frontend:latest`

## Quick Start

### 1. Build Docker Images

```bash
# Build backend image
cd application/backend
docker build -t ticketnow-backend:latest .

# Build frontend image
cd application/frontend
docker build -t ticketnow-frontend:latest .
```

### 2. Deploy to Kubernetes

```bash
# Deploy all resources
kubectl apply -k .

# Or deploy individually
kubectl apply -f namespace.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f backend-configmap.yaml
kubectl apply -f backend-secrets.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-configmap.yaml
kubectl apply -f frontend-secrets.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f ingress.yaml
```

### 3. Access the Application

If using minikube:
```bash
# Get the frontend URL
minikube service ticketnow-frontend-service -n ticketnow

# Get the backend URL
minikube service ticketnow-backend-service -n ticketnow
```

If using ingress with nginx:
```bash
# Add to /etc/hosts
echo "$(minikube ip) ticketnow.local" | sudo tee -a /etc/hosts

# Access at http://ticketnow.local
```

## Configuration

### Environment Variables

Update the ConfigMaps and Secrets with your actual values:

1. **Backend Secrets** (`backend-secrets.yaml`):
   - JWT secret
   - Stripe keys
   - AWS S3 credentials
   - SendGrid API key

2. **Frontend Secrets** (`frontend-secrets.yaml`):
   - Stripe publishable key

3. **ConfigMaps**:
   - Database URLs
   - S3 bucket configuration
   - Application URLs

### Base64 Encoding Secrets

To encode secrets in base64:
```bash
echo -n "your-secret-value" | base64
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MongoDB       │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   Database      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Redis         │    │   PVC           │
│   (nginx)       │    │   Cache         │    │   Storage       │
│   Port: 80/443  │    │   Port: 6379    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Monitoring

Check pod status:
```bash
kubectl get pods -n ticketnow
kubectl logs -f deployment/ticketnow-backend -n ticketnow
kubectl logs -f deployment/ticketnow-frontend -n ticketnow
```

## Scaling

Scale the applications:
```bash
kubectl scale deployment ticketnow-backend --replicas=3 -n ticketnow
kubectl scale deployment ticketnow-frontend --replicas=3 -n ticketnow
```

## Cleanup

Remove all resources:
```bash
kubectl delete -k .
```
