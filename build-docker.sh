#!/bin/bash

# Docker Build Script for TicketNow
# Usage: ./build-docker.sh [version] [username]
# Example: ./build-docker.sh v1.0.2 yourusername
# Example: ./build-docker.sh latest yourusername

set -e

# Default values
VERSION=${1:-latest}
USERNAME=${2:-yourusername}

echo "Building Docker images with version: $VERSION"
echo "Docker Hub username: $USERNAME"

# Build backend
echo "Building backend image..."
docker build -t $USERNAME/ticketnow-backend:$VERSION ./application/backend

# Build frontend
echo "Building frontend image..."
docker build -t $USERNAME/ticketnow-frontend:$VERSION ./application/frontend

echo "Build completed successfully!"
echo "Images created:"
echo "  - $USERNAME/ticketnow-backend:$VERSION"
echo "  - $USERNAME/ticketnow-frontend:$VERSION"

# Optional: Push to Docker Hub (uncomment if you want to push)
# echo "Pushing images to Docker Hub..."
# docker push $USERNAME/ticketnow-backend:$VERSION
# docker push $USERNAME/ticketnow-frontend:$VERSION
# echo "Images pushed successfully!"
