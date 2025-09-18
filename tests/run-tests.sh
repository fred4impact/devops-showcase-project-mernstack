#!/bin/bash

# TicketNow Smoke Tests Runner
# This script runs the smoke tests with proper setup and teardown

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready on $host:$port..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$host:$port" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "$service_name failed to start within expected time"
    return 1
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running backend API tests..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js to run tests."
        exit 1
    fi

    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm to run tests."
        exit 1
    fi

    # Check if backend is running
    if ! port_in_use 3000; then
        print_warning "Backend is not running on port 3000. Starting backend..."
        
        # Start backend in background
        cd ../application/backend
        npm run start:dev &
        BACKEND_PID=$!
        cd ../../tests
        
        # Wait for backend to be ready
        if ! wait_for_service "http://localhost" "3000" "Backend API"; then
            print_error "Failed to start backend. Please start it manually and try again."
            exit 1
        fi
    else
        print_success "Backend is already running on port 3000"
    fi

    # Install test dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing test dependencies..."
        npm install
    fi

    # Run backend tests
    print_status "Executing backend tests..."
    npm run test:backend
    
    if [ $? -eq 0 ]; then
        print_success "Backend tests completed successfully!"
    else
        print_error "Backend tests failed!"
        exit 1
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running frontend component tests..."
    
    # Check if frontend is running
    if ! port_in_use 3001; then
        print_warning "Frontend is not running on port 3001. Starting frontend..."
        
        # Start frontend in background
        cd ../application/frontend
        npm run dev &
        FRONTEND_PID=$!
        cd ../../tests
        
        # Wait for frontend to be ready
        if ! wait_for_service "http://localhost" "3001" "Frontend"; then
            print_error "Failed to start frontend. Please start it manually and try again."
            exit 1
        fi
    else
        print_success "Frontend is already running on port 3001"
    fi

    # Run frontend tests
    print_status "Executing frontend tests..."
    npm run test:frontend
    
    if [ $? -eq 0 ]; then
        print_success "Frontend tests completed successfully!"
    else
        print_error "Frontend tests failed!"
        exit 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Ensure both backend and frontend are running
    if ! port_in_use 3000; then
        print_error "Backend must be running on port 3000 for integration tests"
        exit 1
    fi

    if ! port_in_use 3001; then
        print_error "Frontend must be running on port 3001 for integration tests"
        exit 1
    fi

    # Run integration tests
    print_status "Executing integration tests..."
    npm run test:integration
    
    if [ $? -eq 0 ]; then
        print_success "Integration tests completed successfully!"
    else
        print_error "Integration tests failed!"
        exit 1
    fi
}

# Function to run all tests
run_all_tests() {
    print_status "Running all smoke tests..."
    
    # Run tests in sequence
    run_backend_tests
    run_frontend_tests
    run_integration_tests
    
    print_success "All tests completed successfully!"
}

# Function to cleanup background processes
cleanup() {
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Stopping backend process (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend process (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Main script logic
main() {
    print_status "TicketNow Smoke Tests Runner"
    print_status "=============================="
    
    # Parse command line arguments
    case "${1:-all}" in
        "backend")
            run_backend_tests
            ;;
        "frontend")
            run_frontend_tests
            ;;
        "integration")
            run_integration_tests
            ;;
        "all")
            run_all_tests
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [backend|frontend|integration|all|help]"
            echo ""
            echo "Options:"
            echo "  backend     Run backend API tests only"
            echo "  frontend    Run frontend component tests only"
            echo "  integration Run integration tests only"
            echo "  all         Run all tests (default)"
            echo "  help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run all tests"
            echo "  $0 backend           # Run backend tests only"
            echo "  $0 frontend          # Run frontend tests only"
            echo "  $0 integration       # Run integration tests only"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
