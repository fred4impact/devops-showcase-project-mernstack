module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/backend/**/*.test.ts',
    '**/frontend/**/*.test.tsx',
    '**/integration/**/*.test.ts',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true
};
