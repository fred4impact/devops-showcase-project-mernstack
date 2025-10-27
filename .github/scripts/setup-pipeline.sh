#!/bin/bash

# GitHub Actions CI/CD Pipeline Setup Script
# This script helps set up the CI/CD pipeline for the TicketNow MERN stack project

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if git is installed
    if ! command_exists git; then
        print_error "Git is not installed. Please install git first."
        exit 1
    fi
    
    # Check if node is installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command_exists docker; then
        print_warning "Docker is not installed. Docker is required for building container images."
        print_warning "Please install Docker Desktop or Docker Engine."
    fi
    
    print_success "Prerequisites check completed."
}

# Function to validate project structure
validate_project_structure() {
    print_status "Validating project structure..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] && [ ! -d "application" ]; then
        print_error "This doesn't appear to be the TicketNow project root directory."
        print_error "Please run this script from the project root directory."
        exit 1
    fi
    
    # Check for required directories
    required_dirs=("application/backend" "application/frontend" ".github/workflows")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            print_error "Required directory not found: $dir"
            exit 1
        fi
    done
    
    # Check for required files
    required_files=("application/backend/package.json" "application/frontend/package.json" ".github/workflows/ci-cd.yml")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file not found: $file"
            exit 1
        fi
    done
    
    print_success "Project structure validation completed."
}

# Function to check GitHub repository setup
check_github_setup() {
    print_status "Checking GitHub repository setup..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "This is not a git repository. Please initialize git first."
        exit 1
    fi
    
    # Check if remote origin is set
    if ! git remote get-url origin >/dev/null 2>&1; then
        print_warning "No remote origin found. Please add a GitHub repository as origin:"
        print_warning "git remote add origin https://github.com/username/repository.git"
    else
        print_success "GitHub remote origin is configured."
    fi
    
    # Check if we're on a supported branch
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" && "$current_branch" != "develop" ]]; then
        print_warning "You're not on main or develop branch. Current branch: $current_branch"
        print_warning "The CI/CD pipeline is configured to run on main and develop branches."
    fi
}

# Function to validate Docker setup
validate_docker_setup() {
    print_status "Validating Docker setup..."
    
    if ! command_exists docker; then
        print_warning "Docker is not installed. Skipping Docker validation."
        return
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker Desktop or Docker Engine."
        exit 1
    fi
    
    # Test Docker build for backend
    print_status "Testing Docker build for backend..."
    if docker build -t test-backend application/backend >/dev/null 2>&1; then
        print_success "Backend Docker build test passed."
        docker rmi test-backend >/dev/null 2>&1
    else
        print_error "Backend Docker build test failed."
        exit 1
    fi
    
    # Test Docker build for frontend
    print_status "Testing Docker build for frontend..."
    if docker build -t test-frontend application/frontend >/dev/null 2>&1; then
        print_success "Frontend Docker build test passed."
        docker rmi test-frontend >/dev/null 2>&1
    else
        print_error "Frontend Docker build test failed."
        exit 1
    fi
}

# Function to check GitHub Actions setup
check_github_actions_setup() {
    print_status "Checking GitHub Actions setup..."
    
    # Check if workflow file exists
    if [ ! -f ".github/workflows/ci-cd.yml" ]; then
        print_error "CI/CD workflow file not found: .github/workflows/ci-cd.yml"
        exit 1
    fi
    
    # Validate YAML syntax
    if command_exists yamllint; then
        print_status "Validating YAML syntax..."
        if yamllint .github/workflows/ci-cd.yml >/dev/null 2>&1; then
            print_success "YAML syntax validation passed."
        else
            print_warning "YAML syntax validation failed. Please check the workflow file."
        fi
    else
        print_warning "yamllint not found. Skipping YAML syntax validation."
    fi
}

# Function to provide setup instructions
provide_setup_instructions() {
    print_status "Setup Instructions:"
    echo ""
    echo "1. GitHub Repository Secrets:"
    echo "   Go to your repository → Settings → Secrets and variables → Actions"
    echo "   Add the following secrets:"
    echo "   - DOCKERHUB_USERNAME: Your DockerHub username"
    echo "   - DOCKERHUB_TOKEN: Your DockerHub access token"
    echo ""
    echo "2. DockerHub Setup:"
    echo "   - Create account at https://hub.docker.com"
    echo "   - Generate access token in Account Settings → Security"
    echo "   - Add token to GitHub Secrets"
    echo ""
    echo "3. Enable GitHub Security Features:"
    echo "   - Go to repository Settings → Security"
    echo "   - Enable 'Dependabot alerts'"
    echo "   - Enable 'Dependabot security updates'"
    echo "   - Enable 'Code scanning alerts'"
    echo ""
    echo "4. Branch Protection Rules:"
    echo "   - Go to Settings → Branches"
    echo "   - Add protection rules for main and develop branches"
    echo "   - Require status checks to pass"
    echo ""
    echo "5. Test the Pipeline:"
    echo "   - Push changes to main or develop branch"
    echo "   - Check Actions tab for workflow execution"
    echo "   - Review logs for any issues"
    echo ""
}

# Function to run local tests
run_local_tests() {
    print_status "Running local tests..."
    
    # Test backend
    print_status "Testing backend..."
    cd application/backend
    if npm test -- --watchAll=false >/dev/null 2>&1; then
        print_success "Backend tests passed."
    else
        print_warning "Backend tests failed. Please check test configuration."
    fi
    cd ../..
    
    # Test frontend build
    print_status "Testing frontend build..."
    cd application/frontend
    if npm run build >/dev/null 2>&1; then
        print_success "Frontend build passed."
    else
        print_warning "Frontend build failed. Please check build configuration."
    fi
    cd ../..
}

# Function to display pipeline information
display_pipeline_info() {
    print_status "Pipeline Information:"
    echo ""
    echo "Pipeline Stages:"
    echo "1. Checkout - Retrieve source code"
    echo "2. SAST Scan - Static Application Security Testing with CodeQL"
    echo "3. Build & Test - Compile, lint, type-check, and test"
    echo "4. Build Docker - Containerize applications"
    echo "5. Security Scan - Container vulnerability scanning"
    echo "6. Push Images - Store in DockerHub registry"
    echo "7. Cleanup - Resource cleanup and notifications"
    echo ""
    echo "Triggers:"
    echo "- Push to main or develop branches"
    echo "- Pull requests to main or develop branches"
    echo ""
    echo "Matrix Strategy:"
    echo "- Backend and Frontend services run in parallel"
    echo "- Security scans run for each service"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "GitHub Actions CI/CD Pipeline Setup"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    validate_project_structure
    check_github_setup
    validate_docker_setup
    check_github_actions_setup
    run_local_tests
    
    echo ""
    print_success "All checks completed successfully!"
    echo ""
    
    display_pipeline_info
    provide_setup_instructions
    
    echo "=========================================="
    print_success "Setup completed! Follow the instructions above to complete the configuration."
    echo "=========================================="
}

# Run main function
main "$@"
