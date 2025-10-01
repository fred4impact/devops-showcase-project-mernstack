#!/bin/bash

# GitHub Actions Self-Hosted Runner Setup Script
# This script automates the setup of a self-hosted runner called "shared"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if required parameters are provided
if [ $# -lt 3 ]; then
    print_error "Usage: $0 <github-username> <repository-name> <registration-token>"
    print_error "Example: $0 myusername myrepo ABC123DEF456"
    exit 1
fi

GITHUB_USERNAME=$1
REPOSITORY_NAME=$2
REGISTRATION_TOKEN=$3
RUNNER_NAME="shared"
RUNNER_LABELS="shared,linux,x64,docker,nodejs"

print_status "Setting up GitHub Actions self-hosted runner..."
print_status "Repository: $GITHUB_USERNAME/$REPOSITORY_NAME"
print_status "Runner name: $RUNNER_NAME"
print_status "Labels: $RUNNER_LABELS"

# Step 1: Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install required dependencies
print_status "Installing required dependencies..."

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common jq build-essential

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
print_status "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Step 3: Create runner user
print_status "Creating dedicated runner user..."
sudo useradd -m -s /bin/bash github-runner || print_warning "User github-runner already exists"
sudo usermod -aG docker github-runner

# Step 4: Setup runner directory
print_status "Setting up runner directory..."
sudo mkdir -p /home/github-runner/actions-runner
sudo chown github-runner:github-runner /home/github-runner/actions-runner

# Step 5: Download and configure runner
print_status "Downloading GitHub Actions runner..."
cd /home/github-runner/actions-runner

# Get latest runner version
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/v//')
print_status "Downloading runner version: $RUNNER_VERSION"

# Download the runner
sudo -u github-runner curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract the runner
sudo -u github-runner tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Step 6: Configure the runner
print_status "Configuring the runner..."
sudo -u github-runner ./config.sh \
    --url https://github.com/$GITHUB_USERNAME/$REPOSITORY_NAME \
    --token $REGISTRATION_TOKEN \
    --name $RUNNER_NAME \
    --labels $RUNNER_LABELS \
    --work _work \
    --replace

# Step 7: Install and start the service
print_status "Installing runner service..."
sudo ./svc.sh install github-runner

print_status "Starting runner service..."
sudo ./svc.sh start

# Step 8: Verify installation
print_status "Verifying runner installation..."
sleep 5

if sudo ./svc.sh status | grep -q "active (running)"; then
    print_success "Runner service is running!"
else
    print_error "Runner service failed to start. Check logs with: sudo journalctl -u actions.runner.* -f"
    exit 1
fi

# Step 9: Configure Docker daemon
print_status "Configuring Docker daemon..."
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

# Step 10: Setup cleanup cron job
print_status "Setting up cleanup cron job..."
(crontab -u github-runner -l 2>/dev/null; echo "0 2 * * * find /home/github-runner/actions-runner/_work -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true") | crontab -u github-runner -

# Step 11: Create test workflow
print_status "Creating test workflow..."
sudo -u github-runner mkdir -p /home/github-runner/test-workflow
sudo -u github-runner tee /home/github-runner/test-workflow/test.yml > /dev/null <<EOF
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
          echo "OS: \$(uname -a)"
          echo "Node: \$(node --version)"
          echo "Docker: \$(docker --version)"
          echo "Available disk space:"
          df -h
          echo "Available memory:"
          free -h
EOF

print_success "GitHub Actions self-hosted runner setup completed!"
print_status "Runner name: $RUNNER_NAME"
print_status "Labels: $RUNNER_LABELS"
print_status "Service status: $(sudo ./svc.sh status | grep Active)"
print_status ""
print_status "Next steps:"
print_status "1. Go to your repository: https://github.com/$GITHUB_USERNAME/$REPOSITORY_NAME"
print_status "2. Navigate to Settings > Actions > Runners"
print_status "3. Verify the 'shared' runner is online"
print_status "4. Test your workflows with the new runner"
print_status ""
print_status "Useful commands:"
print_status "- Check runner status: sudo ./svc.sh status"
print_status "- View runner logs: sudo journalctl -u actions.runner.* -f"
print_status "- Stop runner: sudo ./svc.sh stop"
print_status "- Start runner: sudo ./svc.sh start"
print_status "- Uninstall runner: sudo ./svc.sh uninstall"
print_status ""
print_status "Test workflow created at: /home/github-runner/test-workflow/test.yml"
print_success "Setup complete! 🚀"
