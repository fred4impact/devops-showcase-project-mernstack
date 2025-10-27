# MERN Stack DevOps Showcase Project

A production-ready ticketing platform demonstrating modern DevOps practices with Kubernetes, GitOps, monitoring, and cloud deployment strategies.

## 🎯 Quick Start for DevOps Engineers

### 🚀 Deploy to Kubernetes (5 minutes)

```bash
# 1. Clone and deploy
git clone https://github.com/your-org/mernstack-devops-showcase-project.git
cd mernstack-devops-showcase-project

# 2. Build and push images
docker build -t your-registry/ticketnow-backend:latest ./application/backend
docker build -t your-registry/ticketnow-frontend:latest ./application/frontend
docker push your-registry/ticketnow-backend:latest
docker push your-registry/ticketnow-frontend:latest

# 3. Update image references
sed -i 's|your-registry|your-actual-registry|g' kubernetes/*.yaml

# 4. Deploy to Kubernetes
kubectl apply -k kubernetes/

# 5. Check deployment
kubectl get pods -n ticketnow
kubectl get services -n ticketnow
```

### 📊 Health Check

```bash
# Check application status
kubectl get pods -n ticketnow
kubectl logs -f deployment/backend -n ticketnow

# Test endpoints
kubectl port-forward svc/backend-service -n ticketnow 3001:3001
curl http://localhost:3001/health
```

## 🏗️ Infrastructure Overview

### System Architecture

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Application Layer"
            FE[Frontend<br/>Next.js]
            BE[Backend API<br/>NestJS]
        end
        
        subgraph "Data Layer"
            DB[(MongoDB)]
            RD[(Redis)]
        end
        
        subgraph "Monitoring"
            PROM[Prometheus]
            GRAF[Grafana]
        end
    end
    
    subgraph "External Services"
        REG[Container Registry]
        GIT[Git Repository]
        S3[AWS S3]
        STRIPE[Stripe API]
    end
    
    FE --> BE
    BE --> DB
    BE --> RD
    BE --> S3
    BE --> STRIPE
    GIT --> REG
    REG --> FE
    REG --> BE
    BE --> PROM
    PROM --> GRAF
```

### Kubernetes Resources

| Component | Type | Replicas | Purpose |
|-----------|------|----------|---------|
| **Frontend** | Deployment | 3 | Next.js web app |
| **Backend** | Deployment | 3 | NestJS API |
| **MongoDB** | StatefulSet | 1 | Primary database |
| **Redis** | StatefulSet | 1 | Cache & sessions |
| **Ingress** | Ingress | - | External access |
| **Monitoring** | Deployment | 1 | Prometheus + Grafana |

## 🚀 Deployment Options

### Option 1: Kubernetes (Recommended)

```bash
# Deploy to Kubernetes
kubectl apply -k kubernetes/

# Check deployment status
kubectl get pods -n ticketnow
kubectl get services -n ticketnow
kubectl get ingress -n ticketnow
```

### Option 2: ArgoCD GitOps (Advanced)

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Deploy via ArgoCD
kubectl apply -f argocd/application.yaml

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Option 3: Docker Compose (Local)

```bash
# Quick local deployment
cd application
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend
```

## 🔧 Configuration

### Kubernetes Secrets

```bash
# Create secrets for production
kubectl create secret generic ticketnow-secrets \
  --from-literal=JWT_SECRET="your_jwt_secret" \
  --from-literal=STRIPE_SECRET_KEY="sk_live_your_stripe_key" \
  --from-literal=S3_ACCESS_KEY="your_s3_access_key" \
  --from-literal=S3_SECRET_KEY="your_s3_secret_key" \
  --from-literal=SENDGRID_API_KEY="your_sendgrid_key" \
  --from-literal=MONGO_URI="mongodb://user:pass@mongodb-service:27017/ticketnow" \
  --from-literal=REDIS_URL="redis://redis-service:6379" \
  --namespace=ticketnow
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET` | Authentication | `your_jwt_secret` |
| `STRIPE_SECRET_KEY` | Payments | `sk_live_...` |
| `S3_ACCESS_KEY` | File storage | `AKIA...` |
| `SENDGRID_API_KEY` | Email service | `SG...` |
| `MONGO_URI` | Database connection | `mongodb://...` |
| `REDIS_URL` | Cache connection | `redis://...` |

## 🔄 CI/CD Pipeline

### GitOps Workflow

```mermaid
graph LR
    DEV[Developer] --> GIT[Git Push]
    GIT --> CI[CI Pipeline]
    CI --> REG[Container Registry]
    REG --> ARGO[ArgoCD]
    ARGO --> K8S[Kubernetes]
    K8S --> MON[Monitoring]
```

### Pipeline Stages

1. **Security Scan** - Vulnerability scanning
2. **Build** - Compile and test applications
3. **Docker Build** - Create container images
4. **Deploy** - Push to registry and deploy

### Quick Commands

```bash
# Trigger pipeline
git push origin main

# Check pipeline status
curl -H "PRIVATE-TOKEN: your-token" \
  "https://gitlab.com/api/v4/projects/your-project-id/pipelines"

# Manual deployment
kubectl apply -k kubernetes/
```

## 📊 Monitoring & Observability

### Quick Setup

```bash
# Install Prometheus & Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin123

# Access Grafana
kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80
# URL: http://localhost:3000
# Username: admin
# Password: admin123
```

### Health Checks

```bash
# Application health
kubectl get pods -n ticketnow
kubectl logs -f deployment/backend -n ticketnow

# Database health
kubectl exec -it deployment/mongodb -n ticketnow -- mongosh --eval "db.adminCommand('ping')"
kubectl exec -it deployment/redis -n ticketnow -- redis-cli ping

# Resource usage
kubectl top pods -n ticketnow
kubectl top nodes
```

### Monitoring Stack

| Component | Purpose | Access |
|-----------|---------|--------|
| **Prometheus** | Metrics collection | Port 9090 |
| **Grafana** | Dashboards | Port 3000 |
| **AlertManager** | Alerting | Port 9093 |
| **Mongo Express** | DB Admin | Port 8081 |
| **Redis Commander** | Cache Admin | Port 8082 |

## 🔒 Security

### Basic Security Setup

```bash
# Create network policies
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ticketnow-network-policy
  namespace: ticketnow
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  egress:
  - to: []
EOF

# Security scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ticketnow-backend:latest
```

### Security Best Practices

- ✅ **Secrets Management** - Use Kubernetes secrets
- ✅ **Network Policies** - Restrict pod communication
- ✅ **Image Scanning** - Scan container images
- ✅ **RBAC** - Role-based access control
- ✅ **Pod Security** - Non-root containers

## 📈 Scaling & Performance

### Auto-scaling

```bash
# Horizontal Pod Autoscaler
kubectl autoscale deployment backend --cpu-percent=70 --min=2 --max=10 -n ticketnow
kubectl autoscale deployment frontend --cpu-percent=70 --min=2 --max=8 -n ticketnow

# Check scaling status
kubectl get hpa -n ticketnow
kubectl top pods -n ticketnow
```

### Performance Optimization

```bash
# Resource limits
kubectl describe pod <pod-name> -n ticketnow | grep -A 5 "Limits\|Requests"

# Database optimization
kubectl exec -it deployment/mongodb -n ticketnow -- mongosh --eval "
db.events.createIndex({ 'slug': 1 }, { unique: true });
db.orders.createIndex({ 'userId': 1, 'createdAt': -1 });
"
```

## 🚨 Troubleshooting

### Common Issues

```bash
# Pod not starting
kubectl describe pod <pod-name> -n ticketnow
kubectl logs <pod-name> -n ticketnow

# Service not accessible
kubectl get svc -n ticketnow
kubectl describe svc <service-name> -n ticketnow

# Database connection issues
kubectl exec -it deployment/backend -n ticketnow -- node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));
"
```

### Debug Commands

```bash
# General debugging
kubectl get all -n ticketnow
kubectl describe pod <pod-name> -n ticketnow
kubectl logs -f <pod-name> -n ticketnow

# Network debugging
kubectl exec -it deployment/backend -n ticketnow -- nslookup mongodb-service
kubectl exec -it deployment/backend -n ticketnow -- ping mongodb-service

# Resource debugging
kubectl top pods -n ticketnow
kubectl top nodes
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ImagePullBackOff` | Cannot pull image | Check image name and registry |
| `CrashLoopBackOff` | Container crashing | Check logs and environment variables |
| `Pending` | Pod not scheduled | Check resource requests and node capacity |
| `FailedMount` | Cannot mount volume | Check PVC status and storage class |

## 🔄 Backup & Recovery

### Database Backup

```bash
# MongoDB backup
kubectl exec -it deployment/mongodb -n ticketnow -- mongodump --out /backup

# Redis backup
kubectl exec -it deployment/redis -n ticketnow -- redis-cli BGSAVE
```

### Application Backup

```bash
# Backup Kubernetes resources
kubectl get all -n ticketnow -o yaml > ticketnow-backup.yaml

# Backup persistent volumes
kubectl get pvc -n ticketnow -o yaml > pvc-backup.yaml
```

## 📚 Additional Resources

### Documentation Links

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

### Useful Commands

```bash
# Quick status check
kubectl get pods -n ticketnow && kubectl get svc -n ticketnow

# Full system restart
kubectl delete namespace ticketnow
kubectl apply -k kubernetes/

# Clean up everything
kubectl delete namespace ticketnow
kubectl delete namespace monitoring
```

---

## 🎯 For DevOps Engineers

This application demonstrates modern DevOps practices including:

- ✅ **Containerization** with Docker and Kubernetes
- ✅ **GitOps** with ArgoCD
- ✅ **Monitoring** with Prometheus and Grafana
- ✅ **Security** with network policies and image scanning
- ✅ **Scaling** with horizontal pod autoscaling
- ✅ **CI/CD** with automated pipelines

**Quick Start:**
1. Clone the repository
2. Run `kubectl apply -k kubernetes/`
3. Check status with `kubectl get pods -n ticketnow`
4. Access application via ingress

*This project serves as a comprehensive DevOps showcase, demonstrating modern deployment, monitoring, and management practices for a full-stack application.*
