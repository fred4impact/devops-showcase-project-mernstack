# Jenkins Pipeline Configuration

This directory contains Jenkins pipeline scripts for the MERN Stack DevOps Showcase project.

## Available Pipelines

### 1. Main Pipeline (`Jenkinsfile`)
**Comprehensive pipeline that handles both backend and frontend in parallel**
- ✅ Checkout code
- ✅ Security audit (npm audit)
- ✅ Build applications (backend + frontend)
- ✅ Trivy security scan (dependencies)
- ✅ Build Docker images
- ✅ Scan Docker images with Trivy
- ✅ Push to Docker Hub

### 2. Backend Pipeline (`Jenkinsfile.backend`)
**Dedicated pipeline for backend services**
- ✅ Checkout code
- ✅ Backend security audit
- ✅ Build backend application
- ✅ Trivy scan backend dependencies
- ✅ Build backend Docker image
- ✅ Scan backend Docker image
- ✅ Push backend to Docker Hub

### 3. Frontend Pipeline (`Jenkinsfile.frontend`)
**Dedicated pipeline for frontend services**
- ✅ Checkout code
- ✅ Frontend security audit
- ✅ Build frontend application
- ✅ Trivy scan frontend dependencies
- ✅ Build frontend Docker image
- ✅ Scan frontend Docker image
- ✅ Push frontend to Docker Hub

## Prerequisites

### Jenkins Credentials Required
Configure these credentials in Jenkins:

1. **Docker Hub Credentials**:
   - ID: `docker-hub-username`
   - ID: `docker-hub-password`
   - Type: Username with password

2. **Git Repository Access**:
   - Repository: `git@gitlab.com:fred4impact/mernstack-devops-showcase-project.git`
   - Ensure Jenkins has SSH access to GitLab repository
   - Configure SSH keys in Jenkins if needed

### Jenkins Plugins Required
- Docker Pipeline Plugin
- Git Plugin
- Credentials Plugin

## Usage

### Option 1: Use Main Pipeline (Recommended)
```bash
# In Jenkins, create a new pipeline job and use:
# Pipeline script from SCM
# Repository: git@gitlab.com:fred4impact/mernstack-devops-showcase-project.git
# Script Path: jenkins/Jenkinsfile
```

### Option 2: Use Separate Pipelines
```bash
# For Backend-only pipeline:
# Repository: git@gitlab.com:fred4impact/mernstack-devops-showcase-project.git
# Script Path: jenkins/Jenkinsfile.backend

# For Frontend-only pipeline:
# Repository: git@gitlab.com:fred4impact/mernstack-devops-showcase-project.git
# Script Path: jenkins/Jenkinsfile.frontend
```

## Environment Variables

The pipelines use these environment variables:
- `NODE_VERSION`: Node.js version (default: 18)
- `DOCKER_REGISTRY`: Docker registry URL (default: docker.io)
- `DOCKER_USERNAME`: Docker Hub username (from credentials)
- `DOCKER_PASSWORD`: Docker Hub password (from credentials)
- `BUILD_NUMBER`: Jenkins build number
- `GIT_COMMIT_SHORT`: Short Git commit hash

## Docker Images Created

### Backend Images:
- `{username}/ticketnow-backend:latest`
- `{username}/ticketnow-backend:{BUILD_NUMBER}`
- `{username}/ticketnow-backend:{GIT_COMMIT_SHORT}`

### Frontend Images:
- `{username}/ticketnow-frontend:latest`
- `{username}/ticketnow-frontend:{BUILD_NUMBER}`
- `{username}/ticketnow-frontend:{GIT_COMMIT_SHORT}`

## Security Features

1. **NPM Audit**: Scans for high and moderate severity vulnerabilities
2. **Trivy File System Scan**: Scans application dependencies
3. **Trivy Image Scan**: Scans built Docker images for vulnerabilities
4. **Multi-stage Security**: Security checks at multiple stages

## Performance Optimizations

1. **Parallel Execution**: Backend and frontend processes run in parallel
2. **Docker Layer Caching**: Optimized Docker builds
3. **NPM Caching**: Uses npm cache for faster builds
4. **Cleanup**: Automatic cleanup of Docker resources

## Troubleshooting

### Common Issues:

1. **Docker Login Failed**:
   - Check Docker Hub credentials in Jenkins
   - Verify credentials ID matches pipeline configuration

2. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are available

3. **Trivy Scan Failures**:
   - Ensure Docker is running on Jenkins agent
   - Check Trivy image availability

### Debug Mode:
Add `--debug` flag to any command for verbose output.

## Pipeline Stages Overview

```
Checkout → Security Scan → Build Apps → Trivy Scan → Build Images → Scan Images → Push to Registry
```

Each stage includes proper error handling and cleanup procedures.
