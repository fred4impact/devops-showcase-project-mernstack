# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the TicketNow MERN stack application.

## Workflows

### CI/CD Pipeline (`ci-cd.yml`)

**Purpose**: Complete CI/CD pipeline with security scanning, testing, building, and deployment.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Stages**:
1. **Checkout** - Retrieve source code
2. **SAST Scan** - Static Application Security Testing with CodeQL
3. **Build & Test** - Compile, lint, type-check, and test
4. **Build Docker** - Containerize applications
5. **Security Scan** - Container vulnerability scanning
6. **Push Images** - Store in DockerHub registry
7. **Cleanup** - Resource cleanup and notifications

## Setup Instructions

### 1. Repository Secrets

Add these secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

```bash
# Required secrets
DOCKERHUB_USERNAME=your-dockerhub-username
DOCKERHUB_TOKEN=your-dockerhub-access-token

# Optional secrets (for additional registries)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### 2. DockerHub Setup

1. Create a DockerHub account at [hub.docker.com](https://hub.docker.com)
2. Generate an access token:
   - Go to Account Settings → Security
   - Click "New Access Token"
   - Give it a name (e.g., "GitHub Actions")
   - Copy the token and add it to GitHub Secrets

### 3. Enable GitHub Security Features

1. Go to repository `Settings` → `Security`
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"
4. Enable "Code scanning alerts"

### 4. Branch Protection Rules

Set up branch protection for `main` and `develop`:

1. Go to `Settings` → `Branches`
2. Add rule for `main` branch:
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators
3. Add rule for `develop` branch:
   - Require status checks to pass
   - Require branches to be up to date

## Workflow Configuration

### Environment Variables

The workflow uses these environment variables:

```yaml
env:
  REGISTRY: docker.io                    # Docker registry
  IMAGE_NAME_BACKEND: repo-backend       # Backend image name
  IMAGE_NAME_FRONTEND: repo-frontend     # Frontend image name
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
```

### Matrix Strategy

The workflow uses matrix strategies for parallel execution:

```yaml
# For build-test stage
strategy:
  matrix:
    service: [backend, frontend]

# For security-scan stage  
strategy:
  matrix:
    service: [backend, frontend]
```

## Monitoring and Debugging

### Viewing Workflow Runs

1. Go to the `Actions` tab in your repository
2. Click on the workflow run to see details
3. Click on individual jobs to see logs
4. Download logs if needed for debugging

### Common Issues

#### Build Failures
- Check Dockerfile syntax
- Verify all dependencies are installed
- Ensure build commands work locally

#### Security Scan Failures
- Review security scan results in GitHub Security tab
- Update dependencies with known vulnerabilities
- Fix code issues identified by CodeQL

#### Registry Push Failures
- Verify DockerHub credentials
- Check if repository exists
- Ensure proper permissions

### Debug Commands

Add these steps to debug issues:

```yaml
- name: Debug environment
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Docker version: $(docker --version)"
    echo "Working directory: $(pwd)"
    echo "Available files: $(ls -la)"
```

## Customization

### Adding New Services

To add a new service to the pipeline:

1. Add the service to the matrix strategy:
```yaml
strategy:
  matrix:
    service: [backend, frontend, new-service]
```

2. Ensure the service has:
   - `package.json` with test scripts
   - `Dockerfile` for containerization
   - Proper directory structure

### Custom Security Rules

Create `.github/codeql/codeql-config.yml`:

```yaml
name: "Custom CodeQL Configuration"

queries:
  - uses: security-and-quality
  - uses: security-extended
  - name: custom-query
    uses: ./custom-queries

paths-ignore:
  - "**/*.test.js"
  - "**/node_modules/**"
```

### Environment-Specific Builds

Add environment-specific configurations:

```yaml
- name: Build for environment
  run: |
    if [ "${{ github.ref }}" = "refs/heads/main" ]; then
      npm run build:production
    else
      npm run build:staging
    fi
```

## Performance Optimization

### Caching Strategy

The workflow implements several caching strategies:

1. **npm cache**: Caches node_modules between runs
2. **Docker layer cache**: Reuses Docker layers
3. **GitHub Actions cache**: Caches build artifacts

### Parallel Execution

- Matrix strategies run jobs in parallel
- Independent stages can run concurrently
- Security scans run in parallel for each service

### Resource Management

- Cleanup stage removes temporary files
- Artifacts are deleted after use
- Docker images are pruned after builds

## Security Considerations

### Secret Management
- All secrets are stored in GitHub Secrets
- Secrets are not logged in workflow output
- Access is restricted to repository administrators

### Vulnerability Scanning
- CodeQL scans source code for vulnerabilities
- Trivy scans container images for CVEs
- Results are uploaded to GitHub Security tab

### Access Control
- Workflows run with minimal required permissions
- Branch protection prevents direct pushes to main
- Required status checks ensure quality gates

## Troubleshooting

### Workflow Not Triggering
- Check branch names in trigger configuration
- Verify workflow file is in `.github/workflows/`
- Ensure YAML syntax is correct

### Permission Errors
- Verify repository secrets are set correctly
- Check DockerHub token permissions
- Ensure GitHub Actions is enabled

### Build Timeouts
- Optimize Dockerfile for faster builds
- Use multi-stage builds to reduce image size
- Implement proper caching strategies

### Security Scan Failures
- Review and fix identified vulnerabilities
- Update base images to latest versions
- Configure custom security rules if needed

## Best Practices

### Code Quality
- Run linting and type checking
- Maintain high test coverage
- Use consistent code formatting

### Security
- Regular dependency updates
- Security scanning at multiple stages
- Principle of least privilege

### Performance
- Optimize build times
- Use efficient caching
- Parallel execution where possible

### Monitoring
- Set up notifications for failures
- Monitor build metrics
- Regular security reviews

## Support

For issues or questions:

1. Check the [CI-CD-DOCUMENTATION.md](../CI-CD-DOCUMENTATION.md) for detailed explanations
2. Review GitHub Actions logs for error details
3. Test changes locally before pushing
4. Use GitHub Issues for bug reports and feature requests
