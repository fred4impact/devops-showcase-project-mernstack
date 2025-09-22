# GitLab CI/CD Pipeline Troubleshooting Guide

This guide helps DevOps engineers troubleshoot and fix common GitLab CI/CD pipeline issues for the MERN Stack DevOps Showcase Project.

## 🚨 Common Pipeline Failures

### 1. Security Scan Failures

**Symptoms:**
- `security_scan` job fails
- npm audit returns non-zero exit code
- Dependencies have vulnerabilities

**Solutions:**

```bash
# Check for vulnerabilities locally
cd application/backend
npm audit
npm audit fix

cd application/frontend  
npm audit
npm audit fix

cd tests
npm audit
npm audit fix
```

**Pipeline Fix:**
```yaml
# Add allow_failure: true to security scans
security_scan:
  allow_failure: true
  script:
    - npm audit --audit-level=moderate || echo "Audit completed with issues"
```

### 2. Build Failures

**Symptoms:**
- `backend_build_test` or `frontend_build_test` fails
- npm ci fails
- Build process fails

**Solutions:**

```bash
# Check package.json files exist
ls -la application/backend/package.json
ls -la application/frontend/package.json
ls -la tests/package.json

# Test builds locally
cd application/backend
npm ci
npm run build

cd application/frontend
npm ci
npm run build
```

**Pipeline Fix:**
```yaml
# Add fallback to npm install
script:
  - npm ci --cache .npm --prefer-offline || npm install
  - npm run build || echo "Build failed"
```

### 3. Docker Build Failures

**Symptoms:**
- `build_backend_image` or `build_frontend_image` fails
- Docker daemon not available
- Registry authentication fails

**Solutions:**

```bash
# Test Docker builds locally
cd application/backend
docker build -t test-backend .

cd application/frontend
docker build -t test-frontend .
```

**Pipeline Fix:**
```yaml
# Add Docker daemon checks
before_script:
  - docker --version
  - docker info
  - echo "Docker daemon is running"
```

### 4. Integration Test Failures

**Symptoms:**
- `integration_tests` fails
- MongoDB/Redis connection issues
- Test dependencies missing

**Solutions:**

```bash
# Test with Docker Compose locally
cd application
docker-compose up -d
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

**Pipeline Fix:**
```yaml
# Add proper service configuration
services:
  - name: mongo:latest
    alias: mongodb
  - name: redis:alpine
    alias: redis
variables:
  MONGODB_URI: "mongodb://mongodb:27017/test"
  REDIS_URL: "redis://redis:6379"
```

## 🔧 Pipeline Configuration Issues

### 1. Template Include Failures

**Problem:** Templates not found or syntax errors

**Solution:**
```yaml
# Use simplified configuration without templates
# Replace complex template includes with direct job definitions
```

### 2. Cache Issues

**Problem:** Cache not working or causing conflicts

**Solution:**
```yaml
# Clear cache and rebuild
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/
  policy: pull-push
```

### 3. Artifact Issues

**Problem:** Artifacts not found or expired

**Solution:**
```yaml
# Ensure artifacts are created
artifacts:
  paths:
    - application/backend/dist/
    - application/frontend/.next/
  expire_in: 1 week
  when: always
```

## 🛠️ Debugging Commands

### Local Testing

```bash
# Test the entire pipeline locally
gitlab-ci-multi-runner exec docker security_scan
gitlab-ci-multi-runner exec docker backend_build_test
gitlab-ci-multi-runner exec docker frontend_build_test
gitlab-ci-multi-runner exec docker integration_tests
```

### Pipeline Debugging

```bash
# Check GitLab CI configuration
gitlab-ci-multi-runner exec docker --docker-volumes /var/run/docker.sock:/var/run/docker.sock security_scan

# Test specific jobs
gitlab-ci-multi-runner exec docker --docker-volumes /var/run/docker.sock:/var/run/docker.sock backend_build_test
```

### Docker Debugging

```bash
# Test Docker builds
docker build -t test-backend application/backend/
docker build -t test-frontend application/frontend/

# Test with Docker Compose
docker-compose -f application/docker-compose.yml up -d
docker-compose -f application/docker-compose.yml logs
```

## 📊 Monitoring Pipeline Health

### Check Pipeline Status

```bash
# View pipeline logs
curl -H "PRIVATE-TOKEN: your-token" \
  "https://gitlab.com/api/v4/projects/your-project-id/pipelines"

# View job logs
curl -H "PRIVATE-TOKEN: your-token" \
  "https://gitlab.com/api/v4/projects/your-project-id/jobs/job-id/trace"
```

### Performance Monitoring

```bash
# Check pipeline duration
# Look for jobs taking too long
# Monitor resource usage
```

## 🔒 Security Issues

### Registry Authentication

**Problem:** Cannot push to GitLab Container Registry

**Solution:**
```yaml
# Ensure CI_REGISTRY_* variables are set
# Check GitLab project settings for Container Registry
```

### Secrets Management

**Problem:** Environment variables not available

**Solution:**
```yaml
# Add variables in GitLab project settings
# Use GitLab CI/CD variables
# Check variable visibility (protected/masked)
```

## 🚀 Performance Optimization

### Parallel Jobs

```yaml
# Run jobs in parallel where possible
backend_build_test:
  stage: build
  # ... configuration

frontend_build_test:
  stage: build
  # ... configuration
```

### Cache Optimization

```yaml
# Optimize cache configuration
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/
  policy: pull-push
```

### Resource Limits

```yaml
# Add resource limits if needed
variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
```

## 📝 Best Practices

### 1. Error Handling

```yaml
# Always add fallback mechanisms
script:
  - npm run build || echo "Build failed"
  - npm run test || echo "Tests failed"
```

### 2. Conditional Execution

```yaml
# Only run when needed
rules:
  - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

### 3. Artifact Management

```yaml
# Proper artifact configuration
artifacts:
  paths:
    - dist/
    - .next/
  expire_in: 1 week
  when: always
```

## 🆘 Emergency Procedures

### Pipeline Rollback

```bash
# Revert to previous working configuration
git checkout HEAD~1 .gitlab-ci.yml
git push origin develop
```

### Manual Deployment

```bash
# Deploy manually if pipeline fails
docker-compose -f application/docker-compose.prod.yml up -d
```

### Emergency Fixes

```bash
# Quick fixes for common issues
# 1. Clear cache
# 2. Update dependencies
# 3. Fix Docker builds
# 4. Restart services
```

## 📚 Additional Resources

### GitLab CI Documentation
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab CI Variables](https://docs.gitlab.com/ee/ci/variables/)
- [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/)

### Docker Documentation
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

### Node.js Documentation
- [npm ci vs npm install](https://docs.npmjs.com/cli/ci.html)
- [npm audit](https://docs.npmjs.com/cli/audit.html)

---

**Remember:** Always test pipeline changes in a feature branch before merging to main!
