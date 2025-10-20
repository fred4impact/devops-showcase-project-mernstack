# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for the TicketNow application.

## Workflows

### 1. Simple CI/CD Pipeline (`simple-ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via `workflow_dispatch`
- Tag pushes (for releases)

**What it does:**
1. **Checkout code** - Gets the latest code
2. **Build applications** - Installs dependencies and builds both backend and frontend
3. **Optional testing** - Runs tests (can be skipped with `[skip tests]` in commit message)
4. **Build Docker images** - Creates Docker images for both applications
5. **Push to registry** - Pushes images to GitHub Container Registry (ghcr.io)

**Key Features:**
- ✅ Simple and focused
- ✅ Matrix strategy for backend/frontend
- ✅ Optional testing (skip with `[skip tests]`)
- ✅ Docker image caching
- ✅ Automatic tagging based on branch/commit
- ✅ Uses GitHub Container Registry

### 2. Deployment Pipeline (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Tag pushes (releases)
- Manual trigger with environment selection

**What it does:**
1. **Updates Kubernetes manifests** - Replaces image tags with latest built images
2. **Deploys to Kubernetes** - Applies all Kubernetes resources
3. **Waits for rollout** - Ensures deployments are ready
4. **Shows status** - Displays pod, service, and ingress status

## Usage

### Running the Pipeline

1. **Automatic**: Push code to `main` or `develop` branch
2. **Manual**: Go to Actions tab → Select workflow → "Run workflow"

### Skipping Tests

Add `[skip tests]` to your commit message:
```bash
git commit -m "feat: add new feature [skip tests]"
```

### Image Tags

Images are automatically tagged based on:
- **Branch**: `ghcr.io/username/repo/backend:main`
- **Commit SHA**: `ghcr.io/username/repo/backend:main-abc1234`
- **Tags**: `ghcr.io/username/repo/backend:v1.0.0`
- **Latest**: `ghcr.io/username/repo/backend:latest` (main branch only)

## Configuration

### Required Secrets

No additional secrets needed - uses `GITHUB_TOKEN` automatically.

### Environment Variables

- `REGISTRY`: GitHub Container Registry (ghcr.io)
- `BACKEND_IMAGE`: Repository path for backend image
- `FRONTEND_IMAGE`: Repository path for frontend image

### Kubernetes Integration

The deployment workflow automatically:
1. Updates image tags in Kubernetes manifests
2. Applies changes to the cluster
3. Waits for successful rollout

## Monitoring

### View Workflow Runs
1. Go to your repository
2. Click "Actions" tab
3. Select the workflow to see runs

### Check Build Status
- ✅ Green: All steps passed
- ❌ Red: One or more steps failed
- 🟡 Yellow: Workflow in progress

### View Logs
Click on any workflow run to see detailed logs for each step.

## Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version compatibility
2. **Docker build failures**: Verify Dockerfile syntax
3. **Push failures**: Check repository permissions
4. **Deployment failures**: Verify kubectl configuration

### Debug Steps

1. Check workflow logs in GitHub Actions
2. Verify all required files exist
3. Test Docker builds locally
4. Validate Kubernetes manifests

## Customization

### Adding More Steps

Edit the workflow files to add:
- Security scanning
- Code quality checks
- Additional testing
- Notification steps

### Changing Registry

Update the `REGISTRY` environment variable to use:
- Docker Hub
- AWS ECR
- Azure Container Registry
- Custom registry

### Environment-Specific Deployments

Modify the deployment workflow to:
- Deploy to different environments
- Use different Kubernetes contexts
- Apply environment-specific configurations