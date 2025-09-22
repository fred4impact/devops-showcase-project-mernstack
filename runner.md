# GitLab Runner Setup Guide

This guide provides step-by-step instructions to set up a GitLab runner on an Ubuntu server (DigitalOcean) for your MERN stack project.

## Prerequisites

- DigitalOcean account
- GitLab project with CI/CD enabled
- SSH access to your server

## Step 1: Create Ubuntu Server on DigitalOcean

1. **Log into DigitalOcean** and create a new droplet
2. **Choose Ubuntu 22.04 LTS** (or latest LTS version)
3. **Select appropriate size** (minimum 2GB RAM, 2 vCPUs recommended for CI/CD)
4. **Add SSH key** for secure access
5. **Create the droplet** and note the IP address

## Step 2: Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

## Step 3: Install GitLab Runner

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Add GitLab's official repository
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash

# Install GitLab Runner
sudo apt-get install gitlab-runner -y

# Verify installation
gitlab-runner --version
```

## Step 4: Install Docker (Recommended for CI/CD)

```bash
# Install Docker
sudo apt-get install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add gitlab-runner user to docker group
sudo usermod -aG docker gitlab-runner

# Verify Docker installation
docker --version
```

## Step 5: Get GitLab Registration Token

1. **Go to your GitLab project**
2. **Navigate to Settings → CI/CD**
3. **Expand "Runners" section**
4. **Copy the registration token** (or use project-specific token)

## Step 6: Register the Runner

### For Docker Executor (Recommended)

```bash
# Register the runner with Docker executor
sudo gitlab-runner register \
  --url "https://gitlab.com/" \
  --registration-token "YOUR_REGISTRATION_TOKEN" \
  --executor "docker" \
  --docker-image "node:18" \
  --description "Ubuntu Runner for MERN Stack" \
  --tag-list "docker,ubuntu,mern" \
  --run-untagged="true" \
  --locked="false" \
  --access-level="not_protected"
```

### For Shell Executor (Alternative)

```bash
# Register the runner with shell executor
sudo gitlab-runner register \
  --url "https://gitlab.com/" \
  --registration-token "YOUR_REGISTRATION_TOKEN" \
  --executor "shell" \
  --description "Ubuntu Shell Runner" \
  --tag-list "shell,ubuntu"
```

## Step 7: Start and Enable GitLab Runner

```bash
# Start GitLab Runner service
sudo systemctl start gitlab-runner

# Enable GitLab Runner to start on boot
sudo systemctl enable gitlab-runner

# Check runner status
sudo systemctl status gitlab-runner

# Verify runner is registered
sudo gitlab-runner list
```

## Step 8: Configure Runner (Optional)

Edit the runner configuration:
```bash
sudo nano /etc/gitlab-runner/config.toml
```

Example configuration for Docker executor:
```toml
[[runners]]
  name = "Ubuntu Runner for MERN Stack"
  url = "https://gitlab.com/"
  token = "YOUR_RUNNER_TOKEN"
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "node:18"
    privileged = false
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
```

## Step 9: Test Your Runner

1. **Go to your GitLab project**
2. **Navigate to Settings → CI/CD → Runners**
3. **Verify your runner appears** in the list
4. **Create a simple `.gitlab-ci.yml`** to test:

```yaml
stages:
  - test

test_job:
  stage: test
  image: node:18
  script:
    - echo "Hello from GitLab Runner!"
    - node --version
    - npm --version
  tags:
    - docker
```

## Step 10: Security Considerations

```bash
# Configure firewall (if needed)
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Update system regularly
sudo apt update && sudo apt upgrade -y
```

## Troubleshooting

### Check Runner Logs
```bash
sudo journalctl -u gitlab-runner -f
```

### Restart Runner
```bash
sudo systemctl restart gitlab-runner
```

### Unregister Runner (if needed)
```bash
sudo gitlab-runner unregister --name "Runner Name"
```

### Check Runner Status
```bash
# List all runners
sudo gitlab-runner list

# Check runner configuration
sudo gitlab-runner verify
```

## MERN Stack Specific Configuration

For your MERN stack project, you might want to configure the runner with these specific settings:

```bash
# Register with Node.js and Docker support
sudo gitlab-runner register \
  --url "https://gitlab.com/" \
  --registration-token "YOUR_TOKEN" \
  --executor "docker" \
  --docker-image "node:18" \
  --description "MERN Stack Runner" \
  --tag-list "mern,docker,node" \
  --run-untagged="true"
```

## Example .gitlab-ci.yml for MERN Stack

```yaml
stages:
  - install
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

# Install dependencies
install_dependencies:
  stage: install
  image: node:18
  script:
    - npm install
  cache:
    paths:
      - node_modules/
  tags:
    - docker

# Run tests
test_frontend:
  stage: test
  image: node:18
  script:
    - cd frontend
    - npm install
    - npm test
  tags:
    - docker

test_backend:
  stage: test
  image: node:18
  script:
    - cd backend
    - npm install
    - npm test
  tags:
    - docker

# Build application
build_app:
  stage: build
  image: node:18
  script:
    - npm run build
  artifacts:
    paths:
      - build/
  tags:
    - docker

# Deploy to production
deploy_production:
  stage: deploy
  image: node:18
  script:
    - echo "Deploying to production..."
    - # Add your deployment commands here
  only:
    - main
  tags:
    - docker
```

## Benefits of This Setup

- **Automated CI/CD**: Automatically run tests and deploy on code changes
- **Docker Support**: Containerized builds for consistency
- **Scalable**: Can handle multiple concurrent jobs
- **Secure**: Isolated execution environment
- **Flexible**: Support for multiple programming languages and tools

## Next Steps

1. Set up your `.gitlab-ci.yml` file in your project root
2. Configure environment variables in GitLab
3. Set up deployment targets
4. Configure notifications for build status
5. Set up monitoring and logging

---

**Note**: Replace `YOUR_SERVER_IP`, `YOUR_REGISTRATION_TOKEN`, and other placeholders with your actual values.
