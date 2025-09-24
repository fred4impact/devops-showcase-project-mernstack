# Jenkins CI/CD Pipeline for MERN Stack DevOps Showcase

This directory contains Jenkins CI/CD pipeline configurations that mirror the GitLab CI flow for the MERN Stack DevOps Showcase Project.

## Pipeline Overview

The Jenkins pipelines provide the same functionality as the GitLab CI pipeline with the following stages:

1. **Security Scan** - Dependency and code security scanning
2. **Build Applications** - Backend and frontend application building
3. **Run Tests** - Unit, integration, and smoke tests
4. **Docker Build** - Container image building and optimization
5. **Docker Security Scan** - Container vulnerability scanning
6. **Deploy** - Registry push and environment deployment

## Available Pipelines

### 1. Main Pipeline (`Jenkinsfile`)
**Purpose**: Complete CI/CD pipeline matching GitLab CI flow
**Usage**: Primary pipeline for full application lifecycle
**Stages**: Security → Build → Test → Docker Build → Docker Security → Deploy

### 2. Security Pipeline (`Jenkinsfile.security`)
**Purpose**: Comprehensive security scanning and vulnerability assessment
**Usage**: Security-focused pipeline for vulnerability management
**Features**:
- Dependency vulnerability scanning (npm audit, Snyk, Retire.js)
- Static Application Security Testing (SAST)
- Container security scanning (Trivy, Snyk, Docker Scout)
- License compliance checking

### 3. Build & Test Pipeline (`Jenkinsfile.build-test`)
**Purpose**: Application building and comprehensive testing
**Usage**: Development and quality assurance pipeline
**Features**:
- Application building (Backend & Frontend)
- Code quality checks (linting, type checking)
- Unit tests with coverage reporting
- Integration tests
- Smoke tests
- Quality gates with coverage thresholds

### 4. Docker Pipeline (`Jenkinsfile.docker`)
**Purpose**: Docker image building, security scanning, and optimization
**Usage**: Container-focused pipeline
**Features**:
- Docker image building
- Image optimization and analysis
- Container security scanning
- Multi-architecture builds
- Image testing and validation

### 5. Deploy Pipeline (`Jenkinsfile.deploy`)
**Purpose**: Deployment to various environments and registries
**Usage**: Production deployment pipeline
**Features**:
- Docker registry authentication
- Image tagging and pushing
- Environment-specific deployments
- Rollback capabilities
- Deployment notifications

## Setup Instructions

### Prerequisites

1. **Jenkins Server** with the following plugins:
   - Pipeline Plugin
   - Docker Pipeline Plugin
   - Git Plugin
   - Credentials Plugin
   - HTML Publisher Plugin
   - Build Timeout Plugin

2. **Required Tools**:
   - Docker
   - Node.js 18
   - npm
   - Git

3. **Optional Security Tools**:
   - Trivy
   - Snyk CLI
   - Semgrep
   - Dive

### Jenkins Configuration

#### 1. Global Tool Configuration

Navigate to **Manage Jenkins** → **Global Tool Configuration**:

- **NodeJS**: Install Node.js 18
- **Docker**: Ensure Docker is available in PATH

#### 2. Credentials Setup

Create the following credentials in **Manage Jenkins** → **Credentials**:

1. **Docker Hub Credentials**:
   - Kind: Username with password
   - ID: `docker-hub-credentials`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub access token

2. **Git Credentials** (if using private repositories):
   - Kind: Username with password or SSH Username with private key
   - ID: `git-credentials`

#### 3. Environment Variables

Set the following environment variables in **Manage Jenkins** → **Configure System**:

```bash
# Docker Configuration
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-access-token

# Optional: Notification Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
EMAIL_RECIPIENTS=admin@yourcompany.com

# Optional: Security Tools
SNYK_TOKEN=your-snyk-token
```

### Pipeline Setup

#### 1. Create New Pipeline Job

1. Go to **New Item** → **Pipeline**
2. Enter job name (e.g., "MERN-Stack-CI-CD")
3. Click **OK**

#### 2. Configure Pipeline

1. **Pipeline Definition**: Pipeline script from SCM
2. **SCM**: Git
3. **Repository URL**: Your repository URL
4. **Credentials**: Select git-credentials (if needed)
5. **Script Path**: `jenkins/Jenkinsfile`

#### 3. Configure Triggers

- **GitHub hook trigger for GITScm polling**: Enable for automatic builds
- **Poll SCM**: `H/5 * * * *` (every 5 minutes)
- **Build periodically**: Optional

#### 4. Configure Build Environment

- **Delete workspace before build starts**: Recommended
- **Add timestamps to the Console Output**: Recommended

### Pipeline Usage

#### Running the Main Pipeline

1. **Automatic Triggers**:
   - Push to `main` or `develop` branches
   - Pull request creation/updates

2. **Manual Triggers**:
   - Click **Build Now** in Jenkins UI
   - Use **Build with Parameters** for custom configurations

#### Running Specialized Pipelines

1. **Security Pipeline**:
   - Use `jenkins/Jenkinsfile.security` as script path
   - Run manually or on security-related branches

2. **Build & Test Pipeline**:
   - Use `jenkins/Jenkinsfile.build-test` as script path
   - Ideal for development branches

3. **Docker Pipeline**:
   - Use `jenkins/Jenkinsfile.docker` as script path
   - Run when Docker images need to be built/updated

4. **Deploy Pipeline**:
   - Use `jenkins/Jenkinsfile.deploy` as script path
   - Run for production deployments

### Pipeline Parameters

#### Deploy Pipeline Parameters

- **DEPLOY_ENVIRONMENT**: Choose between `staging` or `production`
- **FORCE_DEPLOY**: Boolean to force deployment even if tests fail
- **CUSTOM_TAG**: Custom tag for deployment (optional)

### Monitoring and Notifications

#### Build Status Monitoring

1. **Jenkins Dashboard**: View all pipeline statuses
2. **Build History**: Track build trends and failures
3. **Console Output**: Detailed logs for troubleshooting

#### Notifications

1. **Email Notifications**: Configure in Jenkins system settings
2. **Slack Notifications**: Set `SLACK_WEBHOOK_URL` environment variable
3. **Build Status**: Automatic notifications on success/failure

### Artifacts and Reports

#### Generated Artifacts

- **Build Artifacts**: Compiled applications (`dist/`, `.next/`)
- **Test Reports**: Coverage reports and test results
- **Security Reports**: Vulnerability scan results
- **Docker Reports**: Image analysis and security reports
- **Deployment Reports**: Deployment summaries and configurations

#### Report Access

1. **HTML Reports**: Available in build artifacts
2. **Coverage Reports**: Published as HTML reports
3. **Security Reports**: JSON and HTML formats
4. **Docker Reports**: Markdown and JSON formats

### Troubleshooting

#### Common Issues

1. **Docker Permission Denied**:
   ```bash
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

2. **Node.js Version Issues**:
   - Ensure Node.js 18 is installed
   - Check Jenkins Global Tool Configuration

3. **Docker Registry Login Failed**:
   - Verify Docker Hub credentials
   - Check credential ID in pipeline

4. **Security Scan Failures**:
   - Install required security tools (Trivy, Snyk)
   - Check tool permissions and configurations

#### Debug Commands

```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Check Docker status
docker ps
docker images

# Test security tools
trivy --version
snyk --version
```

### Best Practices

#### Security

1. **Credential Management**: Use Jenkins credential store
2. **Secret Scanning**: Regular security scans
3. **Access Control**: Limit pipeline access
4. **Audit Logging**: Enable Jenkins audit logs

#### Performance

1. **Parallel Execution**: Use parallel stages where possible
2. **Caching**: Enable npm and Docker layer caching
3. **Resource Limits**: Set appropriate timeouts
4. **Cleanup**: Regular artifact and image cleanup

#### Reliability

1. **Error Handling**: Comprehensive error handling
2. **Retry Logic**: Implement retry mechanisms
3. **Rollback**: Automated rollback capabilities
4. **Monitoring**: Continuous monitoring and alerting

### Pipeline Customization

#### Environment-Specific Configurations

1. **Development**: Faster builds, fewer security checks
2. **Staging**: Full pipeline with staging deployment
3. **Production**: Enhanced security, manual approval gates

#### Custom Stages

Add custom stages by modifying the Jenkinsfile:

```groovy
stage('Custom Stage') {
    steps {
        script {
            echo "Running custom stage..."
            // Your custom logic here
        }
    }
}
```

### Integration with GitLab CI

This Jenkins setup provides equivalent functionality to the GitLab CI pipeline:

| GitLab CI Stage | Jenkins Equivalent | Jenkinsfile |
|----------------|-------------------|-------------|
| security | Security Scan | Jenkinsfile.security |
| build | Build Applications | Jenkinsfile.build-test |
| test | Run Tests | Jenkinsfile.build-test |
| docker-build | Docker Build | Jenkinsfile.docker |
| image-scan | Docker Security Scan | Jenkinsfile.docker |
| docker-push | Deploy | Jenkinsfile.deploy |

### Support and Maintenance

#### Regular Maintenance Tasks

1. **Plugin Updates**: Keep Jenkins plugins updated
2. **Security Updates**: Regular security tool updates
3. **Pipeline Optimization**: Monitor and optimize build times
4. **Documentation**: Keep documentation current

#### Monitoring Metrics

1. **Build Success Rate**: Track pipeline reliability
2. **Build Duration**: Monitor performance trends
3. **Resource Usage**: CPU, memory, and storage usage
4. **Security Scan Results**: Track vulnerability trends

For additional support or questions, refer to the main project documentation or create an issue in the project repository.
