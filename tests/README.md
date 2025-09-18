# TicketNow Smoke Tests

This directory contains comprehensive smoke tests for the TicketNow MERN stack application. These tests are designed to verify that the major functionalities of the application work correctly without being overly complex.

## Test Structure

```
tests/
├── package.json                 # Test dependencies and scripts
├── jest.config.js              # Jest configuration
├── setup.ts                    # Test setup and global configuration
├── README.md                   # This file
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

## Test Categories

### 1. Backend API Tests (`backend/`)
- **Authentication**: User registration, login, profile management
- **Events**: Event creation, updating, publishing, retrieval
- **Orders**: Order creation, retrieval, statistics
- **Cart**: Cart management, item operations

### 2. Frontend Component Tests (`frontend/`)
- **UI Components**: Button, Card, Input, Badge components
- **Page Components**: Homepage, Login, Register, Events pages

### 3. Integration Tests (`integration/`)
- **User Flows**: Complete user journeys (registration → event creation → ticket purchase)
- **API Integration**: Cross-module functionality testing

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
cd tests
npm install
```

2. Ensure the backend and frontend applications are running:
```bash
# Backend (from application/backend/)
npm run start:dev

# Frontend (from application/frontend/)
npm run dev
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:backend      # Backend API tests only
npm run test:frontend     # Frontend component tests only
npm run test:integration   # Integration tests only

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Individual Test Files

```bash
# Run specific test files
npx jest backend/auth.test.ts
npx jest frontend/components.test.tsx
npx jest integration/user-flows.test.ts
```

## Test Configuration

### Environment Variables

Create a `.env` file in the tests directory with the following variables:

```env
# Backend API
BACKEND_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/ticketnow-test

# Frontend
FRONTEND_URL=http://localhost:3001

# Test Configuration
NODE_ENV=test
JWT_SECRET=test-secret-key
```

### Jest Configuration

The tests use Jest with the following configuration:
- TypeScript support via `ts-jest`
- 30-second timeout for integration tests
- Coverage reporting
- Setup file for global test configuration

## Test Coverage

The smoke tests cover the following major functionalities:

### ✅ Authentication
- User registration with validation
- User login with credentials
- Profile retrieval and updates
- Password changes
- JWT token handling

### ✅ Event Management
- Event creation by organizers
- Event updates and publishing
- Event retrieval (public and private)
- Event filtering and pagination
- Event statistics

### ✅ Order Processing
- Order creation with ticket details
- Order retrieval by ID and email
- Order statistics and reporting
- Order cancellation

### ✅ Cart Management
- Adding items to cart
- Cart retrieval and updates
- Item quantity modifications
- Cart clearing
- Session-based cart handling

### ✅ Frontend Components
- UI component rendering
- User interaction handling
- Form validation
- Navigation and routing

### ✅ Integration Flows
- Complete user registration flow
- Event creation and management flow
- Ticket purchase flow
- User profile management flow

## Test Data

Tests use dynamic test data to avoid conflicts:
- Unique email addresses using timestamps
- Test events with future dates
- Mock user data for authentication
- Session-based cart operations

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MongoDB is running and accessible
2. **Port Conflicts**: Check that backend (3000) and frontend (3001) ports are available
3. **Authentication**: Verify JWT secret is configured correctly
4. **CORS Issues**: Ensure CORS is properly configured in the backend

### Debug Mode

Run tests with debug output:
```bash
DEBUG=* npm test
```

### Test Isolation

Each test file is designed to be independent:
- Tests create their own test data
- No shared state between test files
- Cleanup is handled automatically

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Use descriptive test names
3. Include both positive and negative test cases
4. Ensure tests are independent and can run in any order
5. Add appropriate error handling and edge cases

## Performance

These smoke tests are designed to be:
- **Fast**: Complete test suite runs in under 5 minutes
- **Reliable**: Minimal flakiness with proper setup/teardown
- **Comprehensive**: Cover all major application features
- **Maintainable**: Clear structure and documentation
