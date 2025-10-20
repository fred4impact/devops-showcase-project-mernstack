# Docker Build and Push Commands for TicketNow

This guide provides Docker commands to build and push your MERN stack application images to Docker Hub.

## Prerequisites

### 1. Docker Hub Account
- Create a Docker Hub account at https://hub.docker.com
- Note your Docker Hub username

### 2. Login to Docker Hub
```bash
# Login to Docker Hub
docker login

# Enter your Docker Hub username and password when prompted
```

## Backend Image (NestJS API)

### Build Backend Image
```bash
# Navigate to backend directory
cd application/backend

# Build the backend image
docker build -t your-dockerhub-username/ticketnow-backend:latest .

# Build with specific tag
docker build -t your-dockerhub-username/ticketnow-backend:v1.0.0 .

# Build for production (using production Dockerfile)
docker build -f Dockerfile -t your-dockerhub-username/ticketnow-backend:latest .

docker run -p 3001:3001 runtesting/ticketnow-backend:v1.0.0
```



### Push Backend Image
```bash
# Push latest tag
docker push your-dockerhub-username/ticketnow-backend:latest

# Push specific version
docker push your-dockerhub-username/ticketnow-backend:v1.0.0

# Push multiple tags
docker push your-dockerhub-username/ticketnow-backend:latest

docker push your-dockerhub-username/ticketnow-backend:v1.0.0
```

## Frontend Image (Next.js)

### Build Frontend Image
```bash
# Navigate to frontend directory
cd application/frontend

# Build the frontend image
docker build -t your-dockerhub-username/ticketnow-frontend:latest .

# Build with specific tag
docker build -t your-dockerhub-username/ticketnow-frontend:v1.0.0 .

# Build for production (using production Dockerfile)
docker build -f Dockerfile -t your-dockerhub-username/ticketnow-frontend:latest .
```

### Push Frontend Image
```bash
# Push latest tag
docker push your-dockerhub-username/ticketnow-frontend:latest

# Push specific version
docker push your-dockerhub-username/ticketnow-frontend:v1.0.0

# Push multiple tags
docker push your-dockerhub-username/ticketnow-frontend:latest
docker push your-dockerhub-username/ticketnow-frontend:v1.0.0
```

## Complete Build and Push Script

### Create a build script
```bash
# Create build script
cat > build-and-push.sh << 'EOF'
#!/bin/bash

# Configuration
DOCKERHUB_USERNAME="your-dockerhub-username"
BACKEND_IMAGE="ticketnow-backend"
FRONTEND_IMAGE="ticketnow-frontend"
VERSION="v1.0.0"

echo "Building and pushing TicketNow images to Docker Hub..."

# Build backend image
echo "Building backend image..."
cd application/backend
docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest .
docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION} .

# Push backend image
echo "Pushing backend image..."
docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${VERSION}

# Build frontend image
echo "Building frontend image..."
cd ../frontend
docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest .
docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION} .

# Push frontend image
echo "Pushing frontend image..."
docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${VERSION}

echo "Build and push completed successfully!"
echo "Backend image: ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest"
echo "Frontend image: ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest"
EOF

# Make script executable
chmod +x build-and-push.sh

# Run the script
./build-and-push.sh
```

## Individual Commands (Step by Step)

### 1. Backend Build and Push
```bash
# Navigate to project root
cd /Users/mac/Documents/mernstack-devops-showcase-project

# Build backend image
docker build -t your-dockerhub-username/ticketnow-backend:latest ./application/backend

# Tag for version
docker tag your-dockerhub-username/ticketnow-backend:latest your-dockerhub-username/ticketnow-backend:v1.0.0

# Push to Docker Hub
docker push your-dockerhub-username/ticketnow-backend:latest
docker push your-dockerhub-username/ticketnow-backend:v1.0.0
```

### 2. Frontend Build and Push
```bash
# Build frontend image
docker build -t your-dockerhub-username/ticketnow-frontend:latest ./application/frontend

# Tag for version
docker tag your-dockerhub-username/ticketnow-frontend:latest your-dockerhub-username/ticketnow-frontend:v1.0.0

# Push to Docker Hub
docker push your-dockerhub-username/ticketnow-frontend:latest
docker push your-dockerhub-username/ticketnow-frontend:v1.0.0
```

## Multi-Architecture Builds (Optional)

### Build for Multiple Architectures
```bash
# Create and use buildx builder
docker buildx create --name multiarch --use

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 \
  -t your-dockerhub-username/ticketnow-backend:latest \
  -t your-dockerhub-username/ticketnow-backend:v1.0.0 \
  --push ./application/backend

docker buildx build --platform linux/amd64,linux/arm64 \
  -t your-dockerhub-username/ticketnow-frontend:latest \
  -t your-dockerhub-username/ticketnow-frontend:v1.0.0 \
  --push ./application/frontend
```

## Verification Commands

### Check Local Images
```bash
# List local images
docker images | grep ticketnow

# Check image details
docker inspect your-dockerhub-username/ticketnow-backend:latest
docker inspect your-dockerhub-username/ticketnow-frontend:latest
```

### Test Images Locally
```bash
# Test backend image
docker run -p 3001:3001 your-dockerhub-username/ticketnow-backend:latest

# Test frontend image
docker run -p 3000:3000 your-dockerhub-username/ticketnow-frontend:latest
```

### Check Docker Hub
```bash
# Pull and verify images from Docker Hub
docker pull your-dockerhub-username/ticketnow-backend:latest
docker pull your-dockerhub-username/ticketnow-frontend:latest

# Run pulled images
docker run -p 3001:3001 your-dockerhub-username/ticketnow-backend:latest
docker run -p 3000:3000 your-dockerhub-username/ticketnow-frontend:latest
```

## Cleanup Commands

### Remove Local Images
```bash
# Remove specific images
docker rmi your-dockerhub-username/ticketnow-backend:latest
docker rmi your-dockerhub-username/ticketnow-frontend:latest

# Remove all ticketnow images
docker rmi $(docker images | grep ticketnow | awk '{print $3}')

# Remove unused images
docker image prune -f
```

### Remove Docker Hub Images (via Web UI)
- Go to https://hub.docker.com
- Navigate to your repository
- Delete tags as needed

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Issues
```bash
# Re-login to Docker Hub
docker logout
docker login

# Check authentication
docker system info | grep -i registry
```

#### 2. Build Context Issues
```bash
# Ensure you're in the correct directory
pwd
# Should be: /Users/mac/Documents/mernstack-devops-showcase-project

# Check Dockerfile exists
ls -la application/backend/Dockerfile
ls -la application/frontend/Dockerfile
```

#### 3. Push Issues
```bash
# Check if image exists locally
docker images | grep ticketnow

# Check Docker Hub repository exists
# Go to https://hub.docker.com and create repositories if needed
```

#### 4. Network Issues
```bash
# Test Docker Hub connectivity
docker pull hello-world
docker run hello-world
```

## Production Deployment Commands

### Update Kubernetes Manifests
After pushing images, update your Kubernetes manifests:

```bash
# Update backend image reference
sed -i 's|your-registry/ticketnow-backend:latest|your-dockerhub-username/ticketnow-backend:latest|g' kubernetes/backend.yaml

# Update frontend image reference
sed -i 's|your-registry/ticketnow-frontend:latest|your-dockerhub-username/ticketnow-frontend:latest|g' kubernetes/frontend.yaml

# Update ArgoCD application
sed -i 's|your-registry/ticketnow-backend:latest|your-dockerhub-username/ticketnow-backend:latest|g' argocd/application.yaml
```

## Quick Reference Commands

### Essential Commands
```bash
# Login to Docker Hub
docker login

# Build backend
docker build -t your-dockerhub-username/ticketnow-backend:latest ./application/backend

# Build frontend
docker build -t your-dockerhub-username/ticketnow-frontend:latest ./application/frontend

# Push both images
docker push your-dockerhub-username/ticketnow-backend:latest
docker push your-dockerhub-username/ticketnow-frontend:latest
```

### Useful Aliases
```bash
# Add to your shell profile
alias docker-build-backend='docker build -t your-dockerhub-username/ticketnow-backend:latest ./application/backend'
alias docker-build-frontend='docker build -t your-dockerhub-username/ticketnow-frontend:latest ./application/frontend'
alias docker-push-all='docker push your-dockerhub-username/ticketnow-backend:latest && docker push your-dockerhub-username/ticketnow-frontend:latest'
```

Replace `your-dockerhub-username` with your actual Docker Hub username throughout these commands!
