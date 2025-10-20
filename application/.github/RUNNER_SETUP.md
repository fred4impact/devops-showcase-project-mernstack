# GitHub Actions Self-Hosted Runner Setup

This guide provides step-by-step instructions for setting up a self-hosted runner called "shared" for your GitHub Actions workflows.

## Prerequisites

- A server/machine with the following specifications:
  - **OS**: Ubuntu 20.04+ (recommended) or similar Linux distribution
  - **CPU**: 4+ cores
  - **RAM**: 8GB+ (16GB recommended for Docker builds)
  - **Storage**: 50GB+ free space
  - **Network**: Stable internet connection
- Administrative access to the server
- GitHub repository with admin permissions

## Step 1: Prepare the Server

### 1.1 Update the System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Dependencies
```bash
# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt install -y jq build-essential
```

### 1.3 Configure Docker (Optional but Recommended)
```bash
# Configure Docker daemon for better performance
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-address-pools": [
    {
      "base": "172.17.0.0/12",
      "size": 24
    }
  ]
}
EOF

sudo systemctl restart docker
```

## Step 2: Create a Dedicated User

### 2.1 Create Runner User
```bash
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner
```

### 2.2 Switch to Runner User
```bash
sudo su - github-runner
```

## Step 3: Download and Configure the Runner

### 3.1 Create Runner Directory
```bash
mkdir -p ~/actions-runner
cd ~/actions-runner
```

### 3.2 Download the Latest Runner
```bash
# Get the latest runner version
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/v//')

# Download the runner
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract the runner
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
```

### 3.3 Configure the Runner
```bash
# Get the registration token from GitHub
# Go to: Settings > Actions > Runners > New self-hosted runner
# Copy the registration token and run:

./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPOSITORY --token YOUR_REGISTRATION_TOKEN --name shared --labels shared,linux,x64 --work _work
```

**Important**: Replace the following placeholders:
- `YOUR_USERNAME`: Your GitHub username
- `YOUR_REPOSITORY`: Your repository name
- `YOUR_REGISTRATION_TOKEN`: The token from GitHub

### 3.4 Configure Runner Labels
The runner will be configured with these labels:
- `shared`: Main label for workflow targeting
- `linux`: Operating system
- `x64`: Architecture

## Step 4: Install and Start the Runner Service

### 4.1 Install the Service
```bash
sudo ./svc.sh install
```

### 4.2 Start the Service
```bash
sudo ./svc.sh start
```

### 4.3 Check Service Status
```bash
sudo ./svc.sh status
```

## Step 5: Verify the Setup

### 5.1 Check Runner Status in GitHub
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Actions** > **Runners**
3. You should see your "shared" runner listed as "Online"

### 5.2 Test the Runner
Create a simple test workflow to verify the runner works:

```yaml
# .github/workflows/test-runner.yml
name: Test Runner
on:
  workflow_dispatch:

jobs:
  test:
    runs-on: shared
    steps:
      - name: Test shared runner
        run: |
          echo "Runner is working!"
          echo "OS: $(uname -a)"
          echo "Node: $(node --version)"
          echo "Docker: $(docker --version)"
```

## Step 6: Configure Runner for Your Workflows

### 6.1 Environment Variables
Set up environment variables for your workflows:

```bash
# Add to ~/.bashrc or ~/.profile
export NODE_ENV=production
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 6.2 Docker Registry Access (if needed)
```bash
# Login to container registries if required
docker login ghcr.io -u YOUR_USERNAME -p YOUR_TOKEN
```

## Step 7: Monitoring and Maintenance

### 7.1 Check Runner Logs
```bash
# View runner logs
sudo journalctl -u actions.runner.* -f

# Or check the runner log file
tail -f ~/actions-runner/_diag/Runner_*.log
```

### 7.2 Update the Runner
```bash
# Stop the service
sudo ./svc.sh stop

# Download latest version
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/v//')
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract and replace
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Start the service
sudo ./svc.sh start
```

### 7.3 Clean Up Work Directories
```bash
# Add to crontab for regular cleanup
crontab -e

# Add this line to clean up old work directories daily
0 2 * * * find /home/github-runner/actions-runner/_work -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
```

## Step 8: Security Considerations

### 8.1 Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow out 443  # HTTPS for GitHub API
sudo ufw allow out 80   # HTTP (if needed)
sudo ufw enable
```

### 8.2 Runner Isolation
```bash
# Create a dedicated network for runner containers
docker network create --driver bridge runner-network
```

### 8.3 Resource Limits
```bash
# Set up systemd limits for the runner service
sudo systemctl edit actions.runner.*.service

# Add resource limits
[Service]
LimitNOFILE=65536
LimitNPROC=32768
```

## Step 9: Troubleshooting

### 9.1 Common Issues

#### Runner Not Appearing in GitHub
- Check if the registration token is correct
- Verify network connectivity to GitHub
- Check runner logs for errors

#### Jobs Not Starting
- Ensure the runner is online in GitHub
- Check if the `shared` label matches your workflow
- Verify runner has sufficient resources

#### Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker github-runner
# Log out and back in, or restart the service
```

#### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a
# Clean up old work directories
find ~/actions-runner/_work -type d -mtime +3 -exec rm -rf {} +
```

### 9.2 Debug Mode
Enable debug logging by setting environment variables:
```bash
export ACTIONS_RUNNER_DEBUG=1
export ACTIONS_STEP_DEBUG=1
```

## Step 10: Advanced Configuration

### 10.1 Multiple Runners
To set up multiple runners on the same machine:
```bash
# Create additional runner directories
mkdir -p ~/actions-runner-2
cd ~/actions-runner-2
# Repeat the configuration process with different names
```

### 10.2 Runner Groups
For organization-level runners:
1. Go to your organization settings
2. Navigate to **Actions** > **Runners**
3. Create a new runner group
4. Configure the runner to use the group

### 10.3 Custom Labels
Add custom labels for specific use cases:
```bash
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPOSITORY --token YOUR_TOKEN --name shared --labels shared,linux,x64,docker,nodejs --work _work
```

## Step 11: Backup and Recovery

### 11.1 Backup Runner Configuration
```bash
# Backup the runner configuration
tar -czf runner-backup-$(date +%Y%m%d).tar.gz ~/actions-runner/
```

### 11.2 Restore Runner
```bash
# Extract backup
tar -xzf runner-backup-YYYYMMDD.tar.gz
# Reconfigure if needed
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPOSITORY --token YOUR_TOKEN --name shared --labels shared,linux,x64 --work _work
```

## Step 12: Performance Optimization

### 12.1 SSD Storage
Use SSD storage for better I/O performance:
```bash
# Mount SSD to runner work directory
sudo mkdir -p /mnt/ssd/actions-runner
sudo chown github-runner:github-runner /mnt/ssd/actions-runner
# Update runner configuration to use SSD path
```

### 12.2 Docker BuildKit
Enable Docker BuildKit for faster builds:
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 12.3 Parallel Jobs
Configure the runner to handle multiple jobs:
```bash
# Edit the runner configuration
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPOSITORY --token YOUR_TOKEN --name shared --labels shared,linux,x64 --work _work --replace
```

## Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check runner status and logs
2. **Monthly**: Update runner version
3. **Quarterly**: Review and clean up old artifacts
4. **As needed**: Monitor resource usage and scale accordingly

### Getting Help
- GitHub Actions documentation: https://docs.github.com/en/actions
- Runner issues: https://github.com/actions/runner/issues
- Community support: GitHub Discussions

## Next Steps

After setting up the runner:

1. **Test your workflows** with the new runner
2. **Monitor performance** and adjust resources as needed
3. **Set up monitoring** for the runner health
4. **Configure backups** for runner configuration
5. **Document any custom configurations** for your team

Your self-hosted runner "shared" is now ready to execute your GitHub Actions workflows!
