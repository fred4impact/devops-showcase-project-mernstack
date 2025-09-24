# Kubernetes Deployment Guide for TicketNow

This guide provides step-by-step instructions to deploy the TicketNow MERN stack application on Kubernetes.

## Prerequisites

### 1. Kubernetes Cluster
Ensure you have a Kubernetes cluster running with:
- Ingress controller (nginx recommended)
- Storage class for persistent volumes
- Container registry access

### 2. Required Tools
```bash
# Install kubectl (if not already installed)
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

### 3. Docker Images
Build and push your application images to a container registry:

```bash
# Build backend image
cd application/backend
docker build -t your-registry/ticketnow-backend:latest .
docker push your-registry/ticketnow-backend:latest

# Build frontend image
cd ../frontend
docker build -t your-registry/ticketnow-frontend:latest .
docker push your-registry/ticketnow-frontend:latest
```

## Deployment Commands

### Method 1: Using Kustomize (Recommended)

```bash
# Navigate to kubernetes directory
cd kubernetes

# Deploy everything with one command
kubectl apply -k .

# Verify deployment
kubectl get all -n ticketnow
```

### Method 2: Individual kubectl Commands

```bash
# Navigate to kubernetes directory
cd kubernetes

# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Create configuration
kubectl apply -f configmap.yaml

# 3. Create secrets (update with your actual values first)
kubectl apply -f secrets.yaml

# 4. Create persistent volume claims
kubectl apply -f pvc.yaml

# 5. Deploy MongoDB
kubectl apply -f mongodb.yaml

# 6. Deploy Redis
kubectl apply -f redis.yaml

# 7. Deploy Backend API
kubectl apply -f backend.yaml

# 8. Deploy Frontend
kubectl apply -f frontend.yaml

# 9. Deploy Admin Tools
kubectl apply -f admin-tools.yaml

# 10. Create Ingress
kubectl apply -f ingress.yaml

# Verify all resources
kubectl get all -n ticketnow
```

## Pre-Deployment Configuration

### 1. Update Docker Image References

Before deploying, update the image references in the deployment files:

```bash
# Update backend image in kubernetes/backend.yaml
sed -i 's/your-registry\/ticketnow-backend:latest/your-actual-registry\/ticketnow-backend:latest/g' kubernetes/backend.yaml

# Update frontend image in kubernetes/frontend.yaml
sed -i 's/your-registry\/ticketnow-frontend:latest/your-actual-registry\/ticketnow-frontend:latest/g' kubernetes/frontend.yaml
```

### 2. Update Secrets with Real Values

```bash
# Create secrets with your actual values
kubectl create secret generic ticketnow-secrets \
  --from-literal=JWT_SECRET="your_actual_jwt_secret_here" \
  --from-literal=STRIPE_SECRET_KEY="sk_live_your_actual_stripe_key" \
  --from-literal=STRIPE_WEBHOOK_SECRET="whsec_your_actual_webhook_secret" \
  --from-literal=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_actual_publishable_key" \
  --from-literal=S3_BUCKET="your_actual_s3_bucket" \
  --from-literal=S3_ACCESS_KEY="your_actual_s3_access_key" \
  --from-literal=S3_SECRET_KEY="your_actual_s3_secret_key" \
  --from-literal=S3_REGION="us-east-1" \
  --from-literal=SENDGRID_API_KEY="your_actual_sendgrid_key" \
  --from-literal=SENDGRID_FROM_EMAIL="noreply@yourdomain.com" \
  --namespace=ticketnow
```

### 3. Update Ingress Host (for Production)

```bash
# Update the ingress host to your actual domain
sed -i 's/ticketnow.local/your-domain.com/g' kubernetes/ingress.yaml
```

## Verification Commands

### Check Deployment Status
```bash
# Check all resources in the namespace
kubectl get all -n ticketnow

# Check specific deployments
kubectl get deployments -n ticketnow

# Check services
kubectl get services -n ticketnow

# Check ingress
kubectl get ingress -n ticketnow

# Check persistent volume claims
kubectl get pvc -n ticketnow
```

### Check Pod Status
```bash
# Get pod status
kubectl get pods -n ticketnow

# Check pod logs
kubectl logs -f deployment/backend -n ticketnow
kubectl logs -f deployment/frontend -n ticketnow
kubectl logs -f deployment/mongodb -n ticketnow
kubectl logs -f deployment/redis -n ticketnow
```

### Check Resource Usage
```bash
# Check resource usage
kubectl top pods -n ticketnow
kubectl top nodes
```

## Accessing the Application

### Local Development Setup
```bash
# Add to /etc/hosts file
echo "127.0.0.1 ticketnow.local" | sudo tee -a /etc/hosts

# Port forward for local access (alternative to ingress)
kubectl port-forward service/frontend-service 3000:3000 -n ticketnow
kubectl port-forward service/backend-service 3001:3001 -n ticketnow
kubectl port-forward service/mongo-express-service 8081:8081 -n ticketnow
kubectl port-forward service/redis-commander-service 8082:8081 -n ticketnow
```

### Access URLs
- **Frontend**: http://ticketnow.local (or http://localhost:3000 with port-forward)
- **Backend API**: http://ticketnow.local/api (or http://localhost:3001 with port-forward)
- **Mongo Express**: http://ticketnow.local/mongo-express (or http://localhost:8081 with port-forward)
- **Redis Commander**: http://ticketnow.local/redis-commander (or http://localhost:8082 with port-forward)

## Scaling Commands

### Scale Application Components
```bash
# Scale backend replicas
kubectl scale deployment backend --replicas=3 -n ticketnow

# Scale frontend replicas
kubectl scale deployment frontend --replicas=3 -n ticketnow

# Check scaling status
kubectl get deployments -n ticketnow
```

### Auto-scaling (if HPA is configured)
```bash
# Create horizontal pod autoscaler
kubectl autoscale deployment backend --cpu-percent=70 --min=2 --max=10 -n ticketnow
kubectl autoscale deployment frontend --cpu-percent=70 --min=2 --max=10 -n ticketnow

# Check HPA status
kubectl get hpa -n ticketnow
```

## Troubleshooting Commands

### Debug Pod Issues
```bash
# Describe pod for detailed information
kubectl describe pod <pod-name> -n ticketnow

# Get pod events
kubectl get events -n ticketnow --sort-by='.lastTimestamp'

# Check pod logs with timestamps
kubectl logs <pod-name> -n ticketnow --timestamps
```

### Debug Service Issues
```bash
# Describe service
kubectl describe service <service-name> -n ticketnow

# Test service connectivity
kubectl run debug-pod --image=busybox -it --rm --restart=Never -n ticketnow -- nslookup backend-service
```

### Debug Ingress Issues
```bash
# Describe ingress
kubectl describe ingress ticketnow-ingress -n ticketnow

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### Database Connection Issues
```bash
# Test MongoDB connection
kubectl run mongo-client --image=mongo:7.0 -it --rm --restart=Never -n ticketnow -- mongosh mongodb://admin:password123@mongodb-service:27017/ticketnow?authSource=admin

# Test Redis connection
kubectl run redis-client --image=redis:7.2-alpine -it --rm --restart=Never -n ticketnow -- redis-cli -h redis-service -a redis123 ping
```

## Maintenance Commands

### Update Application
```bash
# Update backend image
kubectl set image deployment/backend backend=your-registry/ticketnow-backend:v2.0.0 -n ticketnow

# Update frontend image
kubectl set image deployment/frontend frontend=your-registry/ticketnow-frontend:v2.0.0 -n ticketnow

# Check rollout status
kubectl rollout status deployment/backend -n ticketnow
kubectl rollout status deployment/frontend -n ticketnow
```

### Backup Commands
```bash
# Backup MongoDB data
kubectl exec deployment/mongodb -n ticketnow -- mongodump --uri="mongodb://admin:password123@localhost:27017/ticketnow?authSource=admin" --out=/tmp/backup

# Copy backup from pod
kubectl cp ticketnow/mongodb-<pod-id>:/tmp/backup ./mongodb-backup
```

### Cleanup Commands
```bash
# Delete specific resources
kubectl delete -f kubernetes/ingress.yaml
kubectl delete -f kubernetes/frontend.yaml
kubectl delete -f kubernetes/backend.yaml

# Delete all resources in namespace
kubectl delete namespace ticketnow

# Or using kustomize
kubectl delete -k kubernetes/
```

## Monitoring Commands

### Resource Monitoring
```bash
# Watch resource usage
watch kubectl top pods -n ticketnow

# Check resource quotas
kubectl describe quota -n ticketnow

# Check node resources
kubectl top nodes
```

### Log Monitoring
```bash
# Follow all pod logs
kubectl logs -f -l app=backend -n ticketnow
kubectl logs -f -l app=frontend -n ticketnow

# Get logs from all containers
kubectl logs -f deployment/backend -c backend -n ticketnow
```

## Security Commands

### Check Security Context
```bash
# Check pod security context
kubectl get pods -n ticketnow -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.securityContext}{"\n"}{end}'

# Check network policies
kubectl get networkpolicies -n ticketnow
```

### Secret Management
```bash
# List secrets
kubectl get secrets -n ticketnow

# Update secret
kubectl create secret generic ticketnow-secrets \
  --from-literal=JWT_SECRET="new_secret" \
  --namespace=ticketnow \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployments to pick up new secrets
kubectl rollout restart deployment/backend -n ticketnow
kubectl rollout restart deployment/frontend -n ticketnow
```

## Quick Reference

### Essential Commands
```bash
# Deploy everything
kubectl apply -k kubernetes/

# Check status
kubectl get all -n ticketnow

# View logs
kubectl logs -f deployment/backend -n ticketnow

# Scale up
kubectl scale deployment backend --replicas=3 -n ticketnow

# Clean up
kubectl delete namespace ticketnow
```

### Emergency Commands
```bash
# Restart all deployments
kubectl rollout restart deployment/backend -n ticketnow
kubectl rollout restart deployment/frontend -n ticketnow

# Force delete stuck pods
kubectl delete pod <pod-name> -n ticketnow --force --grace-period=0

# Reset deployment
kubectl rollout undo deployment/backend -n ticketnow
```

This guide provides all the commands you need to deploy, manage, and troubleshoot your TicketNow application on Kubernetes!
