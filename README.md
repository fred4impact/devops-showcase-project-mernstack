# MERN Stack DevOps Showcase Project

A comprehensive full-stack ticketing platform demonstrating modern DevOps practices with MERN stack, containerization, CI/CD, and cloud deployment strategies.

## 🎯 DevOps Engineer Quick Start

This section is specifically designed for DevOps engineers who need to deploy, manage, and maintain this application.

### 🚀 One-Command Deployment

```bash
# Clone and deploy locally
git clone https://gitlab.com/your-org/mernstack-devops-showcase-project.git
cd mernstack-devops-showcase-project/application
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### 📊 Application Health Check

```bash
# Check all services status
docker-compose ps

# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Health endpoints
curl http://localhost:3001/health
curl http://localhost:3000
```

## 🏗️ Infrastructure Overview

### Architecture Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cache Layer   │
                       │   (Redis)       │
                       │   Port: 6379    │
                       └─────────────────┘
```

### Service Dependencies

- **Frontend** → Backend API
- **Backend** → MongoDB + Redis
- **MongoDB** → Data persistence
- **Redis** → Session storage + seat locking

## 🐳 Container Management

### Docker Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| Frontend | `ticketnow-frontend` | 3000 | Next.js web application |
| Backend | `ticketnow-backend` | 3001 | NestJS API server |
| MongoDB | `ticketnow-mongodb` | 27017 | Primary database |
| Redis | `ticketnow-redis` | 6379 | Cache and session store |
| Mongo Express | `ticketnow-mongo-express` | 8081 | Database admin UI |
| Redis Commander | `ticketnow-redis-commander` | 8082 | Redis admin UI |

### Container Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs -f [service-name]

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec mongodb mongosh

# Scale services (if needed)
docker-compose up -d --scale backend=3
```

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend Configuration
```bash
# Database
MONGO_URI=mongodb://admin:password123@localhost:27017/ticketnow

# Cache
REDIS_URL=redis://:redis123@localhost:6379

# Security
JWT_SECRET=your_jwt_secret_key_here

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Storage
S3_BUCKET=ticketnow-assets
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key

# Application URLs
FRONTEND_BASE_URL=http://localhost:3000
```

#### Frontend Configuration
```bash
# API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:3001

# Payment Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Application Settings
NEXT_PUBLIC_APP_NAME=TicketNow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment Files Setup

```bash
# Copy environment templates
cp application/backend/env.example application/backend/.env
cp application/frontend/env.example application/frontend/.env

# Edit with your actual values
nano application/backend/.env
nano application/frontend/.env
```

## 🚀 Deployment Strategies

### 1. Local Development Deployment

```bash
# Quick start for development
cd application
docker-compose up -d

# Access points:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - API Docs: http://localhost:3001/api/docs
# - MongoDB Admin: http://localhost:8081 (admin/admin123)
# - Redis Admin: http://localhost:8082
```

### 2. Production Deployment

```bash
# Production deployment with environment variables
export MONGO_URI="mongodb://user:pass@your-mongo-cluster:27017/ticketnow"
export REDIS_URL="redis://your-redis-cluster:6379"
export JWT_SECRET="your-production-jwt-secret"
# ... set all other production variables

docker-compose -f docker-compose.prod.yml up -d
```

### 3. Kubernetes Deployment

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ticketnow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ticketnow-backend
  template:
    metadata:
      labels:
        app: ticketnow-backend
    spec:
      containers:
      - name: backend
        image: your-registry/ticketnow-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: ticketnow-secrets
              key: mongo-uri
```

## 🔄 CI/CD Pipeline Management

### GitLab CI/CD Pipeline

The project includes a comprehensive GitLab CI/CD pipeline with the following stages:

#### Pipeline Stages
1. **Security** - Dependency vulnerability scanning
2. **Build** - Application compilation and testing
3. **Test** - Unit, integration, and E2E tests
4. **Docker Build** - Container image creation
5. **Docker Security** - Container security scanning
6. **Deploy** - Multi-environment deployment

#### Pipeline Commands

```bash
# Trigger pipeline manually
gitlab-ci-multi-runner exec docker security_scan
gitlab-ci-multi-runner exec docker backend_build_test
gitlab-ci-multi-runner exec docker frontend_build_test

# View pipeline status
curl -H "PRIVATE-TOKEN: your-token" \
  "https://gitlab.com/api/v4/projects/your-project-id/pipelines"
```

#### Pipeline Configuration

```yaml
# .gitlab-ci.yml structure
stages:
  - security
  - build
  - test
  - docker-build
  - docker-security
  - deploy

# Key jobs:
# - security_scan: npm audit for all components
# - backend_build_test: NestJS build and test
# - frontend_build_test: Next.js build and test
# - integration_tests: Full application testing
```

## 📊 Monitoring and Observability

### Health Checks

```bash
# Application health endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/health

# Database connectivity
curl http://localhost:3001/api/health/database

# Redis connectivity
curl http://localhost:3001/api/health/redis
```

### Log Management

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Filter logs by level
docker-compose logs backend | grep ERROR
docker-compose logs frontend | grep WARN

# Export logs for analysis
docker-compose logs backend > backend.log
docker-compose logs frontend > frontend.log
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Database performance
docker-compose exec mongodb mongosh --eval "db.stats()"

# Redis performance
docker-compose exec redis redis-cli info stats
```

## 🔒 Security Management

### Security Scanning

```bash
# Run security audits
cd application/backend && npm audit
cd application/frontend && npm audit
cd tests && npm audit

# Fix vulnerabilities
npm audit fix
npm audit fix --force
```

### Container Security

```bash
# Scan container images
docker scan ticketnow-backend:latest
docker scan ticketnow-frontend:latest

# Check for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ticketnow-backend:latest
```

### Secrets Management

```bash
# Use Docker secrets for production
echo "your-secret-value" | docker secret create jwt_secret -
echo "mongodb://user:pass@host:27017/db" | docker secret create mongo_uri -

# Update docker-compose.prod.yml to use secrets
services:
  backend:
    secrets:
      - jwt_secret
      - mongo_uri
```

## 🗄️ Database Management

### MongoDB Operations

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh

# Database backup
docker-compose exec mongodb mongodump --out /backup

# Database restore
docker-compose exec mongodb mongorestore /backup

# Database stats
docker-compose exec mongodb mongosh --eval "db.stats()"
```

### Redis Operations

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Redis backup
docker-compose exec redis redis-cli BGSAVE

# Redis monitoring
docker-compose exec redis redis-cli monitor
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start

```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

#### 2. Database Connection Issues

```bash
# Test MongoDB connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));
"

# Test Redis connection
docker-compose exec backend node -e "
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
client.ping().then(() => console.log('Redis connected'));
"
```

#### 3. Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Kill processes using ports
sudo kill -9 $(lsof -t -i:3000)
sudo kill -9 $(lsof -t -i:3001)
```

#### 4. Memory Issues

```bash
# Check memory usage
docker stats

# Increase Docker memory limit
# Edit Docker Desktop settings or docker-compose.yml
```

### Debug Commands

```bash
# Debug backend container
docker-compose exec backend bash
docker-compose exec backend node --inspect=0.0.0.0:9229

# Debug frontend container
docker-compose exec frontend bash
docker-compose exec frontend npm run dev

# Database debugging
docker-compose exec mongodb mongosh --eval "db.adminCommand('listCollections')"
docker-compose exec redis redis-cli keys "*"
```

## 📈 Scaling and Performance

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Load balancer configuration (nginx example)
upstream backend {
    server backend:3001;
    server backend:3001;
    server backend:3001;
}
```

### Performance Optimization

```bash
# Enable Redis clustering
docker-compose exec redis redis-cli --cluster create \
  redis:6379 redis:6380 redis:6381

# MongoDB replica set
docker-compose exec mongodb mongosh --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongodb:27017' }
  ]
})
"
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# MongoDB backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# Redis backup
docker-compose exec redis redis-cli BGSAVE
docker cp ticketnow-redis:/data/dump.rdb ./backup/
```

### Application Backup

```bash
# Backup application data
docker-compose exec backend tar -czf /backup/app-data.tar.gz /app/data

# Backup configuration
cp -r application/ ./backup/application-$(date +%Y%m%d)
```

## 📚 Additional Resources

### Documentation Links

- [API Documentation](http://localhost:3001/api/docs) - Swagger/OpenAPI docs
- [GitLab CI Pipeline](docs/gitlab_ci_pipeline-flow.md) - Pipeline documentation
- [Commit Guide](docs/git-commit-guide.md) - Development guidelines
- [Test Documentation](tests/README.md) - Testing procedures

### Useful Commands Reference

```bash
# Quick status check
docker-compose ps && curl -s http://localhost:3001/health

# Full system restart
docker-compose down && docker-compose up -d

# Clean up everything
docker-compose down -v --remove-orphans
docker system prune -a

# Update and restart
git pull && docker-compose pull && docker-compose up -d
```

---

## 🎯 For DevOps Engineers

This application demonstrates modern DevOps practices including:

- ✅ **Containerization** with Docker and Docker Compose
- ✅ **CI/CD Pipeline** with GitLab CI/CD
- ✅ **Infrastructure as Code** with Terraform (planned)
- ✅ **Monitoring** with health checks and logging
- ✅ **Security** with vulnerability scanning
- ✅ **Scalability** with horizontal scaling support
- ✅ **Backup/Recovery** procedures
- ✅ **Environment Management** for dev/staging/prod

**Quick Start for DevOps Engineers:**
1. Clone the repository
2. Run `docker-compose up -d` in the application directory
3. Access the application at http://localhost:3000
4. Monitor with `docker-compose logs -f`
5. Scale with `docker-compose up -d --scale backend=3`

---

*This project serves as a comprehensive DevOps showcase, demonstrating modern deployment, monitoring, and management practices for a full-stack application.*