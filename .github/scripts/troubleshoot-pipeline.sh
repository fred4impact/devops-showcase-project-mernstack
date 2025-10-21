#!/bin/bash

# GitHub Actions CI/CD Pipeline Troubleshooting Script
# This script helps diagnose and fix common pipeline issues

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

# Function to check GitHub Actions status
check_github_actions_status() {
    print_status "Checking GitHub Actions status..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository"
        return 1
    fi
    
    # Check if remote origin is GitHub
    if git remote get-url origin 2>/dev/null | grep -q "github.com"; then
        print_success "GitHub repository detected"
    else
        print_warning "Remote origin doesn't appear to be GitHub"
    fi
    
    # Check if Actions are enabled
    print_status "To check if GitHub Actions are enabled:"
    echo "1. Go to your repository on GitHub"
    echo "2. Click on the 'Actions' tab"
    echo "3. If you see a message about enabling Actions, click 'I understand my workflows, go ahead and enable them'"
}

# Function to check workflow file
check_workflow_file() {
    print_status "Checking workflow file..."
    
    workflow_file=".github/workflows/ci-cd.yml"
    
    if [ ! -f "$workflow_file" ]; then
        print_error "Workflow file not found: $workflow_file"
        return 1
    fi
    
    print_success "Workflow file found"
    
    # Check YAML syntax
    if command -v yamllint >/dev/null 2>&1; then
        print_status "Checking YAML syntax..."
        if yamllint "$workflow_file" >/dev/null 2>&1; then
            print_success "YAML syntax is valid"
        else
            print_error "YAML syntax errors found"
            yamllint "$workflow_file"
            return 1
        fi
    else
        print_warning "yamllint not installed. Install with: pip install yamllint"
    fi
}

# Function to check secrets
check_secrets() {
    print_status "Checking required secrets..."
    
    echo "Required secrets in GitHub repository:"
    echo "1. DOCKERHUB_USERNAME - Your DockerHub username"
    echo "2. DOCKERHUB_TOKEN - Your DockerHub access token"
    echo ""
    echo "To add secrets:"
    echo "1. Go to repository Settings → Secrets and variables → Actions"
    echo "2. Click 'New repository secret'"
    echo "3. Add each secret with the exact name and value"
    echo ""
    
    # Check if we can access DockerHub (if Docker is available)
    if command -v docker >/dev/null 2>&1; then
        print_status "Testing DockerHub connectivity..."
        if docker info >/dev/null 2>&1; then
            print_success "Docker daemon is running"
        else
            print_warning "Docker daemon is not running"
        fi
    fi
}

# Function to check project structure
check_project_structure() {
    print_status "Checking project structure..."
    
    # Check for required directories
    required_dirs=("application/backend" "application/frontend")
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "Found directory: $dir"
        else
            print_error "Missing directory: $dir"
        fi
    done
    
    # Check for required files
    required_files=("application/backend/package.json" "application/frontend/package.json")
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found file: $file"
        else
            print_error "Missing file: $file"
        fi
    done
}

# Function to check Docker setup
check_docker_setup() {
    print_status "Checking Docker setup..."
    
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker is not installed"
        echo "Install Docker Desktop or Docker Engine:"
        echo "- macOS: https://docs.docker.com/desktop/mac/install/"
        echo "- Linux: https://docs.docker.com/engine/install/"
        echo "- Windows: https://docs.docker.com/desktop/windows/install/"
        return 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running"
        echo "Start Docker Desktop or Docker Engine"
        return 1
    fi
    
    print_success "Docker is installed and running"
    
    # Test Docker build
    print_status "Testing Docker builds..."
    
    # Test backend build
    print_status "Testing backend Docker build..."
    if docker build -t test-backend application/backend >/dev/null 2>&1; then
        print_success "Backend Docker build successful"
        docker rmi test-backend >/dev/null 2>&1
    else
        print_error "Backend Docker build failed"
        echo "Run manually to see errors: docker build -t test-backend application/backend"
    fi
    
    # Test frontend build
    print_status "Testing frontend Docker build..."
    if docker build -t test-frontend application/frontend >/dev/null 2>&1; then
        print_success "Frontend Docker build successful"
        docker rmi test-frontend >/dev/null 2>&1
    else
        print_error "Frontend Docker build failed"
        echo "Run manually to see errors: docker build -t test-frontend application/frontend"
    fi
}

# Function to check Node.js setup
check_node_setup() {
    print_status "Checking Node.js setup..."
    
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed"
        echo "Install Node.js from: https://nodejs.org/"
        return 1
    fi
    
    node_version=$(node --version)
    print_success "Node.js version: $node_version"
    
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed"
        return 1
    fi
    
    npm_version=$(npm --version)
    print_success "npm version: $npm_version"
    
    # Check Node.js version compatibility
    major_version=$(echo "$node_version" | cut -d'.' -f1 | tr -d 'v')
    if [ "$major_version" -lt 16 ]; then
        print_warning "Node.js version $node_version is older than recommended (16+)"
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking project dependencies..."
    
    # Check backend dependencies
    if [ -f "application/backend/package.json" ]; then
        print_status "Checking backend dependencies..."
        cd application/backend
        
        if [ ! -d "node_modules" ]; then
            print_warning "Backend node_modules not found. Installing dependencies..."
            if npm install; then
                print_success "Backend dependencies installed"
            else
                print_error "Failed to install backend dependencies"
                cd ../..
                return 1
            fi
        else
            print_success "Backend dependencies found"
        fi
        
        # Test backend build
        print_status "Testing backend build..."
        if npm run build >/dev/null 2>&1; then
            print_success "Backend build successful"
        else
            print_error "Backend build failed"
            echo "Run manually to see errors: cd application/backend && npm run build"
        fi
        
        cd ../..
    fi
    
    # Check frontend dependencies
    if [ -f "application/frontend/package.json" ]; then
        print_status "Checking frontend dependencies..."
        cd application/frontend
        
        if [ ! -d "node_modules" ]; then
            print_warning "Frontend node_modules not found. Installing dependencies..."
            if npm install; then
                print_success "Frontend dependencies installed"
            else
                print_error "Failed to install frontend dependencies"
                cd ../..
                return 1
            fi
        else
            print_success "Frontend dependencies found"
        fi
        
        # Test frontend build
        print_status "Testing frontend build..."
        if npm run build >/dev/null 2>&1; then
            print_success "Frontend build successful"
        else
            print_error "Frontend build failed"
            echo "Run manually to see errors: cd application/frontend && npm run build"
        fi
        
        cd ../..
    fi
}

# Function to check tests
check_tests() {
    print_status "Checking tests..."
    
    # Check backend tests
    if [ -f "application/backend/package.json" ]; then
        print_status "Checking backend tests..."
        cd application/backend
        
        if npm run test -- --watchAll=false >/dev/null 2>&1; then
            print_success "Backend tests passed"
        else
            print_warning "Backend tests failed or not configured"
            echo "Run manually to see errors: cd application/backend && npm test"
        fi
        
        cd ../..
    fi
    
    # Check frontend tests (if configured)
    if [ -f "application/frontend/package.json" ]; then
        print_status "Checking frontend tests..."
        cd application/frontend
        
        if grep -q '"test"' package.json; then
            if npm test >/dev/null 2>&1; then
                print_success "Frontend tests passed"
            else
                print_warning "Frontend tests failed"
                echo "Run manually to see errors: cd application/frontend && npm test"
            fi
        else
            print_warning "Frontend tests not configured"
        fi
        
        cd ../..
    fi
}

# Function to provide common solutions
provide_solutions() {
    print_status "Common Solutions:"
    echo ""
    echo "1. Workflow not triggering:"
    echo "   - Check if you're on main or develop branch"
    echo "   - Verify workflow file is in .github/workflows/"
    echo "   - Check YAML syntax for errors"
    echo ""
    echo "2. Build failures:"
    echo "   - Run builds locally to identify issues"
    echo "   - Check Dockerfile syntax"
    echo "   - Verify all dependencies are installed"
    echo ""
    echo "3. Test failures:"
    echo "   - Run tests locally: npm test"
    echo "   - Check test configuration"
    echo "   - Verify test dependencies are installed"
    echo ""
    echo "4. Docker build failures:"
    echo "   - Test Docker builds locally"
    echo "   - Check Dockerfile syntax"
    echo "   - Verify base images are available"
    echo ""
    echo "5. Registry push failures:"
    echo "   - Verify DockerHub credentials"
    echo "   - Check if repository exists"
    echo "   - Ensure proper permissions"
    echo ""
    echo "6. Security scan failures:"
    echo "   - Review security scan results"
    echo "   - Update dependencies with vulnerabilities"
    echo "   - Fix code issues identified by scanners"
    echo ""
}

# Function to display debugging commands
display_debug_commands() {
    print_status "Debugging Commands:"
    echo ""
    echo "1. Check workflow runs:"
    echo "   - Go to GitHub repository → Actions tab"
    echo "   - Click on failed workflow run"
    echo "   - Review logs for each job"
    echo ""
    echo "2. Test locally:"
    echo "   - Backend: cd application/backend && npm test && npm run build"
    echo "   - Frontend: cd application/frontend && npm run build"
    echo "   - Docker: docker build -t test-backend application/backend"
    echo ""
    echo "3. Check secrets:"
    echo "   - Go to repository Settings → Secrets and variables → Actions"
    echo "   - Verify all required secrets are present"
    echo ""
    echo "4. Validate YAML:"
    echo "   - Install yamllint: pip install yamllint"
    echo "   - Run: yamllint .github/workflows/ci-cd.yml"
    echo ""
    echo "5. Check Docker:"
    echo "   - Test Docker: docker run hello-world"
    echo "   - Check Docker daemon: docker info"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "GitHub Actions CI/CD Pipeline Troubleshooting"
    echo "=========================================="
    echo ""
    
    check_github_actions_status
    check_workflow_file
    check_secrets
    check_project_structure
    check_docker_setup
    check_node_setup
    check_dependencies
    check_tests
    
    echo ""
    print_status "Troubleshooting completed!"
    echo ""
    
    provide_solutions
    display_debug_commands
    
    echo "=========================================="
    print_success "If issues persist, check the GitHub Actions logs for detailed error messages."
    echo "=========================================="
}

# Run main function
main "$@"
