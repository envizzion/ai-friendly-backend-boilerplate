import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup that runs once before all tests
  console.log('🧪 Starting test suite...');
});

afterAll(async () => {
  // Cleanup that runs once after all tests
  console.log('✅ Test suite completed');
});

// Reset mocks before each test
beforeEach(() => {
  // Clear all mocks between tests
});