# Test Run Commands Documentation

## Overview

This document provides comprehensive instructions for running tests in the MERN Stack DevOps Showcase Project. The test suite includes backend API tests, frontend component tests, and integration tests.

## Test Structure

```
tests/
├── package.json                 # Test dependencies and scripts
├── jest.config.js              # Jest configuration
├── setup.ts                    # Test setup and global configuration
├── run-tests.sh                # Test runner script
├── backend/                    # Backend API tests
│   ├── auth.test.ts           # Authentication API tests
│   ├── events.test.ts         # Events API tests
│   ├── orders.test.ts         # Orders API tests
│   └── cart.test.ts           # Cart API tests
├── frontend/                   # Frontend component tests
│   ├── components.test.tsx    # UI component tests
│   └── pages.test.tsx         # Page component tests
└── integration/               # Integration tests
    ├── user-flows.test.ts     # Critical user flow tests
    └── api-integration.test.ts # API integration tests
```

## Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **npm**: Latest version
- **MongoDB**: Running instance for integration tests
- **Redis**: Running instance for caching tests

### Application Services
Before running tests, ensure the following services are running:

```bash
# Backend API (Port 3000)
cd application/backend
npm run start:dev

# Frontend Application (Port 3001)
cd application/frontend
npm run dev

# MongoDB (Port 27017)
mongod --dbpath /path/to/your/db

# Redis (Port 6379)
redis-server
```

## Installation

### Install Test Dependencies

```bash
# Navigate to tests directory
cd tests

# Install dependencies
npm install

# Verify installation
npm list
```

### Environment Setup

Create a `.env` file in the tests directory:

```env
# Backend API Configuration
BACKEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/ticketnow-test
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret-key-for-jwt

# Frontend Configuration
FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000

# Test Configuration
NODE_ENV=test
TEST_TIMEOUT=30000
```

## Test Commands

### Quick Start

```bash
# Run all tests
npm test

# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Backend Tests

```bash
# Run all backend tests
npm run test:backend

# Run specific backend test files
npm run test:auth          # Authentication tests
npm run test:events        # Events API tests
npm run test:orders        # Orders API tests
npm run test:cart          # Cart API tests

# Run individual test files
npx jest backend/auth.test.ts
npx jest backend/events.test.ts
npx jest backend/orders.test.ts
npx jest backend/cart.test.ts
```

### Frontend Tests

```bash
# Run all frontend tests
npm run test:frontend

# Run specific frontend test files
npm run test:components    # Component tests
npm run test:pages        # Page tests

# Run individual test files
npx jest frontend/components.test.tsx
npx jest frontend/pages.test.tsx
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test files
npm run test:flows        # User flow tests
npm run test:api          # API integration tests

# Run individual test files
npx jest integration/user-flows.test.ts
npx jest integration/api-integration.test.ts
```

### Test Runner Script

The project includes a comprehensive test runner script:

```bash
# Make script executable
chmod +x run-tests.sh

# Run all tests
./run-tests.sh

# Run specific test suites
./run-tests.sh backend      # Backend tests only
./run-tests.sh frontend     # Frontend tests only
./run-tests.sh integration  # Integration tests only

# Show help
./run-tests.sh help
```

## Advanced Test Commands

### Coverage Analysis

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Coverage with specific thresholds
npm run test:ci
```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debug
DEBUG=* npx jest backend/auth.test.ts

# Verbose output
npm test -- --verbose
```

### Test Filtering

```bash
# Run tests matching pattern
npm test -- --testNamePattern="auth"

# Run tests in specific directory
npm test -- --testPathPattern="backend"

# Run tests with specific tag
npm test -- --testNamePattern="smoke"
```

### Performance Testing

```bash
# Run tests with performance monitoring
npm test -- --detectOpenHandles

# Run tests with memory profiling
node --inspect-brk node_modules/.bin/jest

# Run tests with timeout adjustment
npm test -- --testTimeout=60000
```

## CI/CD Integration

### GitLab CI

The tests are integrated with GitLab CI/CD pipeline:

```yaml
# Backend tests in CI
backend_build_test:
  stage: build
  script:
    - cd tests
    - npm ci
    - npm run test:backend

# Frontend tests in CI
frontend_build_test:
  stage: build
  script:
    - cd tests
    - npm ci
    - npm run test:frontend

# Integration tests in CI
integration_tests:
  stage: test
  services:
    - mongo:latest
    - redis:alpine
  script:
    - cd tests
    - npm ci
    - npm run test:integration
```

### Local CI Simulation

```bash
# Simulate CI environment
npm run test:ci

# Run tests with CI configuration
npm test -- --ci --coverage --watchAll=false
```

## Test Categories and Coverage

### Backend API Tests (`backend/`)

**Authentication Tests** (`auth.test.ts`):
- User registration
- User login
- JWT token validation
- Password reset
- Profile management

**Events Tests** (`events.test.ts`):
- Event creation
- Event updates
- Event publishing
- Event retrieval
- Event statistics

**Orders Tests** (`orders.test.ts`):
- Order creation
- Order retrieval
- Order statistics
- Order cancellation

**Cart Tests** (`cart.test.ts`):
- Add items to cart
- Update cart items
- Remove cart items
- Cart retrieval
- Cart clearing

### Frontend Component Tests (`frontend/`)

**Component Tests** (`components.test.tsx`):
- UI component rendering
- User interactions
- Form validation
- Event handling
- Props validation

**Page Tests** (`pages.test.tsx`):
- Page rendering
- Navigation
- Route handling
- Layout components
- Page-specific functionality

### Integration Tests (`integration/`)

**User Flow Tests** (`user-flows.test.ts`):
- Complete user registration flow
- Event creation and management
- Ticket purchase process
- User profile management
- End-to-end workflows

**API Integration Tests** (`api-integration.test.ts`):
- Cross-module functionality
- API endpoint integration
- Database operations
- External service integration
- Error handling

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx'
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  testTimeout: 30000
};
```

### Test Setup

```typescript
// setup.ts
import '@testing-library/jest-dom';

// Global test configuration
beforeAll(() => {
  // Setup global test environment
});

afterAll(() => {
  // Cleanup global test environment
});

beforeEach(() => {
  // Setup for each test
});

afterEach(() => {
  // Cleanup after each test
});
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check if ports are in use
lsof -i :3000  # Backend port
lsof -i :3001  # Frontend port
lsof -i :27017 # MongoDB port
lsof -i :6379  # Redis port

# Kill processes using ports
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:3001)
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Check Redis status
redis-cli ping

# Reset test database
mongosh ticketnow-test --eval "db.dropDatabase()"
```

#### 3. Test Timeout Issues
```bash
# Increase timeout for specific tests
npm test -- --testTimeout=60000

# Run tests with debug output
DEBUG=* npm test
```

#### 4. Memory Issues
```bash
# Run tests with increased memory
node --max-old-space-size=4096 node_modules/.bin/jest

# Run tests with garbage collection
node --expose-gc node_modules/.bin/jest
```

### Debug Commands

```bash
# Run specific test with debug
npx jest backend/auth.test.ts --verbose

# Run tests with coverage and debug
npm run test:coverage -- --verbose

# Run tests with specific environment
NODE_ENV=test npm test

# Run tests with custom configuration
npx jest --config custom-jest.config.js
```

### Performance Optimization

```bash
# Run tests in parallel
npm test -- --maxWorkers=4

# Run tests with caching
npm test -- --cache

# Run tests with selective execution
npm test -- --onlyChanged
```

## Best Practices

### Test Writing
- Write descriptive test names
- Use proper test structure (Arrange, Act, Assert)
- Test both positive and negative scenarios
- Keep tests independent and isolated
- Use appropriate test data

### Test Organization
- Group related tests together
- Use describe blocks for organization
- Use beforeEach/afterEach for setup/cleanup
- Keep test files focused and manageable

### Test Maintenance
- Regular test updates
- Remove obsolete tests
- Update test data as needed
- Monitor test performance
- Review test coverage regularly

## Monitoring and Reporting

### Test Reports
- **JUnit**: XML format for CI integration
- **Coverage**: HTML and LCOV formats
- **Console**: Detailed test output
- **Logs**: Debug and error information

### Metrics
- Test execution time
- Success/failure rates
- Coverage percentages
- Performance metrics

### Alerts
- Test failures
- Coverage drops
- Performance degradation
- Security vulnerabilities

## Continuous Integration

### Automated Testing
- Pre-commit hooks
- Pull request validation
- Branch protection rules
- Automated reporting

### Quality Gates
- Minimum coverage thresholds
- Performance benchmarks
- Security scan requirements
- Code quality metrics

### Deployment Integration
- Test-driven deployment
- Rollback procedures
- Environment validation
- Production monitoring
