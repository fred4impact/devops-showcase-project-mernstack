#!/bin/bash

# GitHub Actions Self-Hosted Runner Cleanup Script
# This script cleans up old work directories and Docker resources

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

print_status "Cleaning up GitHub Actions runner resources..."

# Clean up old work directories
print_status "Cleaning up old work directories..."
if [ -d "/home/github-runner/actions-runner/_work" ]; then
    find /home/github-runner/actions-runner/_work -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    print_success "Cleaned up old work directories"
else
    print_warning "Work directory not found"
fi

# Clean up Docker resources
print_status "Cleaning up Docker resources..."
docker system prune -f
docker volume prune -f
print_success "Cleaned up Docker resources"

# Clean up old runner downloads
print_status "Cleaning up old runner downloads..."
if [ -d "/home/github-runner/actions-runner" ]; then
    find /home/github-runner/actions-runner -name "actions-runner-linux-x64-*.tar.gz" -mtime +30 -delete 2>/dev/null || true
    print_success "Cleaned up old runner downloads"
else
    print_warning "Runner directory not found"
fi

# Show disk usage
print_status "Current disk usage:"
df -h /home/github-runner/actions-runner 2>/dev/null || print_warning "Cannot check disk usage"

print_success "Cleanup completed successfully!"
