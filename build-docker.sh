#!/bin/bash

# Docker Build Script for TicketNow
# Usage: ./build-docker.sh [version] [registry]
# Example: ./build-docker.sh v1.0.2 runtesting
# Example: ./build-docker.sh latest runtesting

set -e

# Default values
VERSION=${1:-latest}
REGISTRY=${2:-runtesting}

echo "Building Docker images with version: $VERSION"
echo "Registry: $REGISTRY"

# Build backend
echo "Building backend image..."
docker build -t $REGISTRY/ticketnow-backend:$VERSION ./application/backend

# Build frontend
echo "Building frontend image..."
docker build -t $REGISTRY/ticketnow-frontend:$VERSION ./application/frontend

echo "Build completed successfully!"
echo "Images created:"
echo "  - $REGISTRY/ticketnow-backend:$VERSION"
echo "  - $REGISTRY/ticketnow-frontend:$VERSION"

# Optional: Push to registry (uncomment if you want to push)
# echo "Pushing images to registry..."
# docker push $REGISTRY/ticketnow-backend:$VERSION
# docker push $REGISTRY/ticketnow-frontend:$VERSION
# echo "Images pushed successfully!"
