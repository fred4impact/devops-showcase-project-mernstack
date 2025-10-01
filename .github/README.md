# GitHub Actions CI/CD Pipeline

This repository contains comprehensive GitHub Actions workflows for the TicketNow MERN stack application.

## Self-Hosted Runner Setup

This repository uses a self-hosted runner called "shared" for executing GitHub Actions workflows. This provides better performance, control, and cost efficiency compared to GitHub-hosted runners.

### Quick Setup

1. **Run the automated setup script:**
   ```bash
   ./github/scripts/setup-runner.sh <github-username> <repository-name> <registration-token>
   ```

2. **Get registration token:**
   - Go to your repository on GitHub
   - Navigate to **Settings** > **Actions** > **Runners**
   - Click **New self-hosted runner**
   - Copy the registration token

3. **Verify setup:**
   - Check runner status in GitHub
   - Run test workflows
   - Monitor performance

### Runner Management

- **Update runner:** `./github/scripts/update-runner.sh`
- **Cleanup resources:** `./github/scripts/cleanup-runner.sh`
- **Check status:** `sudo ./svc.sh status`
- **View logs:** `sudo journalctl -u actions.runner.* -f`

### Runner Specifications

- **OS:** Ubuntu 20.04+ (Linux)
- **CPU:** 4+ cores recommended
- **RAM:** 8GB+ (16GB for Docker builds)
- **Storage:** 50GB+ free space
- **Labels:** `shared`, `linux`, `x64`, `docker`, `nodejs`

For detailed setup instructions, see [RUNNER_SETUP.md](RUNNER_SETUP.md).

## Workflows Overview

### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

**Stages:**

#### 🔒 Security Stage
- **Trivy vulnerability scanning** for filesystem and dependencies
- **CodeQL analysis** for JavaScript/TypeScript security issues
- **npm audit** for all packages (backend, frontend, tests)
- **SARIF upload** to GitHub Security tab

#### 🏗️ Build Stage
- **Matrix strategy** for backend and frontend builds
- **Node.js 18** setup with npm caching
- **Dependency installation** with `npm ci`
- **Linting** and **type checking**
- **Application building** with artifact upload

#### 🧪 Test Stage
- **Service containers** for MongoDB and Redis
- **Backend unit tests** with coverage
- **Frontend tests** (if configured)
- **Integration tests** with comprehensive coverage
- **Codecov integration** for coverage reporting

#### 🐳 Docker Build Stage
- **Docker Buildx** setup for multi-platform builds
- **Multi-stage builds** for both backend and frontend
- **Build caching** for faster subsequent builds
- **Artifact storage** for Docker images

#### 🔍 Image Scan Stage
- **Trivy container scanning** for vulnerabilities
- **High/Critical severity** blocking
- **SARIF upload** for security reporting

#### 📦 Docker Push Stage
- **Container Registry** push to GitHub Container Registry
- **Multi-tag strategy** (latest, commit SHA, branch)
- **Metadata extraction** with proper labeling
- **Main branch only** deployment

#### 🚀 Deployment Stage (Optional)
- **Staging environment** deployment
- **Environment protection** rules
- **Deployment notifications**

#### 📢 Notification Stage
- **Success/failure notifications**
- **Detailed status reporting**
- **Pipeline result summary**

### 2. Security Scan (`.github/workflows/security-scan.yml`)

**Triggers:**
- Weekly schedule (Monday 2 AM)
- Push to main branch
- Pull requests to main branch

**Features:**
- **Comprehensive Trivy scanning** (filesystem + repository)
- **CodeQL analysis** for code security
- **npm audit** for all packages
- **TruffleHog** for secret detection
- **SARIF upload** for security dashboard

### 3. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Git tags starting with 'v*'

**Features:**
- **Automatic release creation**
- **Docker image building** and pushing
- **Release asset upload**
- **Multi-tag strategy** for container images

### 4. Dependency Update (`.github/workflows/dependency-update.yml`)

**Triggers:**
- Weekly schedule (Monday 9 AM)
- Manual workflow dispatch

**Features:**
- **Automatic dependency updates**
- **npm audit fix** for security patches
- **Pull request creation** for review
- **Multi-package support** (backend, frontend, tests)

## Environment Variables

### Required Secrets

```yaml
GITHUB_TOKEN: # Automatically provided by GitHub
```

### Optional Secrets (for enhanced functionality)

```yaml
# For external notifications
SLACK_WEBHOOK_URL: # Slack notifications
DISCORD_WEBHOOK_URL: # Discord notifications

# For external registries
DOCKER_USERNAME: # Docker Hub username
DOCKER_PASSWORD: # Docker Hub password

# For deployment
KUBECONFIG: # Kubernetes configuration
HELM_REPOSITORY: # Helm chart repository
```

## Service Dependencies

The test stage requires the following services:

- **MongoDB 7.0** - Database for backend testing
- **Redis 7** - Cache and session storage
- **Node.js 18** - Runtime environment

## Security Features

### Vulnerability Scanning
- **Trivy** for comprehensive vulnerability detection
- **CodeQL** for static analysis security testing
- **npm audit** for dependency vulnerability scanning
- **TruffleHog** for secret detection

### Container Security
- **Multi-stage builds** for minimal attack surface
- **Non-root users** in containers
- **Vulnerability scanning** of built images
- **High/Critical severity** blocking

### Code Security
- **SARIF upload** to GitHub Security tab
- **Automated security alerts**
- **Dependency vulnerability tracking**
- **Secret scanning** prevention

## Performance Optimizations

### Caching Strategy
- **npm cache** for faster dependency installation
- **Docker layer caching** with GitHub Actions cache
- **Build artifact caching** for faster builds

### Parallel Execution
- **Matrix strategy** for backend/frontend builds
- **Parallel job execution** where possible
- **Optimized dependency installation**

### Resource Management
- **Multi-stage Docker builds** for smaller images
- **Artifact cleanup** after successful builds
- **Efficient layer caching** strategies

## Monitoring and Notifications

### Success Notifications
- **Pipeline status** reporting
- **Build artifact** availability
- **Deployment status** updates

### Failure Handling
- **Detailed error reporting**
- **Stage-specific failure** identification
- **Retry mechanisms** for transient failures

## Customization

### Adding New Stages
1. Add new job to the main workflow
2. Configure dependencies with `needs:`
3. Add appropriate triggers and conditions

### Modifying Security Scanning
1. Update Trivy configuration
2. Add new security tools
3. Configure severity thresholds

### Extending Testing
1. Add new test suites
2. Configure service containers
3. Update coverage reporting

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify dependency installation
- Review build logs for specific errors

#### Test Failures
- Ensure service containers are running
- Check environment variable configuration
- Verify test database connectivity

#### Docker Issues
- Check Dockerfile syntax
- Verify build context
- Review multi-stage build configuration

#### Security Scan Issues
- Review vulnerability reports
- Update dependencies with known issues
- Configure severity thresholds

### Debug Mode

Enable debug logging by adding:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## Best Practices

### Security
- Regular dependency updates
- Vulnerability scanning
- Secret management
- Container security

### Performance
- Efficient caching strategies
- Parallel job execution
- Resource optimization
- Build artifact management

### Reliability
- Comprehensive testing
- Error handling
- Monitoring and alerting
- Rollback strategies

## Support

For issues with the CI/CD pipeline:

1. Check the GitHub Actions logs
2. Review the security scan results
3. Verify environment configuration
4. Consult the troubleshooting guide

## Contributing

When modifying the workflows:

1. Test changes in a feature branch
2. Update documentation
3. Verify all stages work correctly
4. Submit pull request with detailed description
