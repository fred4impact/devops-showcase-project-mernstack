#!/bin/bash

# GitHub Actions Self-Hosted Runner Update Script
# This script updates the self-hosted runner to the latest version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_status "Updating GitHub Actions self-hosted runner..."

# Check if runner directory exists
if [ ! -d "/home/github-runner/actions-runner" ]; then
    print_error "Runner directory not found. Please run setup-runner.sh first."
    exit 1
fi

cd /home/github-runner/actions-runner

# Stop the service
print_status "Stopping runner service..."
sudo ./svc.sh stop

# Get latest runner version
print_status "Checking for latest runner version..."
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/v//')
print_status "Latest version: $RUNNER_VERSION"

# Download latest version
print_status "Downloading latest runner version..."
sudo -u github-runner curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract new version
print_status "Extracting new runner version..."
sudo -u github-runner tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Start the service
print_status "Starting runner service..."
sudo ./svc.sh start

# Verify installation
print_status "Verifying runner installation..."
sleep 5

if sudo ./svc.sh status | grep -q "active (running)"; then
    print_success "Runner service is running with latest version!"
else
    print_error "Runner service failed to start. Check logs with: sudo journalctl -u actions.runner.* -f"
    exit 1
fi

print_success "GitHub Actions self-hosted runner updated successfully!"
print_status "Service status: $(sudo ./svc.sh status | grep Active)"
