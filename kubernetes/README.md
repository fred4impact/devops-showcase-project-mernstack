# Kubernetes Deployment for TicketNow MERN Stack Application

This directory contains all the Kubernetes manifest files needed to deploy the TicketNow application on a Kubernetes cluster.

## Files Overview

- `namespace.yaml` - Creates the `ticketnow` namespace
- `configmap.yaml` - Non-sensitive configuration data
- `secrets.yaml` - Sensitive data (JWT secrets, API keys, etc.)
- `pvc.yaml` - Persistent volume claims for MongoDB and Redis data
- `mongodb.yaml` - MongoDB deployment and service
- `redis.yaml` - Redis deployment and service
- `backend.yaml` - NestJS backend API deployment and service
- `frontend.yaml` - Next.js frontend deployment and service
- `admin-tools.yaml` - Mongo Express and Redis Commander admin tools
- `ingress.yaml` - Ingress configuration for external access
- `kustomization.yaml` - Kustomize configuration for managing all resources

## Prerequisites

1. **Kubernetes cluster** with:
   - Ingress controller (nginx recommended)
   - Storage class for persistent volumes
   - Container registry access

2. **Docker images** built and pushed to your registry:
   ```bash
   # Build and push backend image
   docker build -t your-registry/ticketnow-backend:latest ./application/backend
   docker push your-registry/ticketnow-backend:latest
   
   # Build and push frontend image
   docker build -t your-registry/ticketnow-frontend:latest ./application/frontend
   docker push your-registry/ticketnow-frontend:latest
   ```

3. **Update image references** in the deployment files:
   - Replace `your-registry` with your actual container registry
   - Update image tags as needed

## Deployment Instructions

### Option 1: Using kubectl (apply all files individually)

```bash
# Apply all manifests
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f pvc.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f redis.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f admin-tools.yaml
kubectl apply -f ingress.yaml
```

### Option 2: Using kustomize (recommended)

```bash
# Deploy everything with kustomize
kubectl apply -k .
```

## Configuration

### Environment Variables

The application uses the following environment variables:

**Backend (NestJS):**
- `NODE_ENV`: production
- `PORT`: 3001
- `MONGO_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `S3_BUCKET`: AWS S3 bucket name
- `SENDGRID_API_KEY`: SendGrid API key

**Frontend (Next.js):**
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `NEXT_PUBLIC_APP_NAME`: Application name

### Secrets Management

**Important:** Update the secrets in `secrets.yaml` with your actual values:

```bash
# Example: Create secrets with actual values
kubectl create secret generic ticketnow-secrets \
  --from-literal=JWT_SECRET="your_actual_jwt_secret" \
  --from-literal=STRIPE_SECRET_KEY="sk_live_your_stripe_key" \
  --from-literal=S3_ACCESS_KEY="your_s3_access_key" \
  --namespace=ticketnow
```

### Storage

- MongoDB data is persisted using a 10Gi PVC
- Redis data is persisted using a 5Gi PVC
- Adjust storage sizes in `pvc.yaml` as needed

## Accessing the Application

### Local Development

Add to your `/etc/hosts` file:
```
127.0.0.1 ticketnow.local
```

Then access:
- **Frontend**: http://ticketnow.local
- **Backend API**: http://ticketnow.local/api
- **Mongo Express**: http://ticketnow.local/mongo-express
- **Redis Commander**: http://ticketnow.local/redis-commander

### Production

Update the ingress host in `ingress.yaml` to your actual domain:
```yaml
spec:
  rules:
  - host: your-domain.com  # Change this
```

## Monitoring and Health Checks

The deployments include:
- **Liveness probes**: Restart containers if they become unresponsive
- **Readiness probes**: Only route traffic to ready containers
- **Resource limits**: Prevent containers from consuming too many resources

## Scaling

To scale the application:

```bash
# Scale backend replicas
kubectl scale deployment backend --replicas=3 -n ticketnow

# Scale frontend replicas
kubectl scale deployment frontend --replicas=3 -n ticketnow
```

## Troubleshooting

### Check pod status:
```bash
kubectl get pods -n ticketnow
```

### Check logs:
```bash
kubectl logs -f deployment/backend -n ticketnow
kubectl logs -f deployment/frontend -n ticketnow
```

### Check services:
```bash
kubectl get svc -n ticketnow
```

### Check ingress:
```bash
kubectl get ingress -n ticketnow
```

## Cleanup

To remove all resources:
```bash
kubectl delete namespace ticketnow
```

Or using kustomize:
```bash
kubectl delete -k .
```
