import 'dotenv/config';

import { z } from 'zod';

const testEnvSchema = z.object({
  // Test-specific database configuration
  TEST_DB_HOST: z.string().default('localhost'),
  TEST_DB_USER: z.string().optional(),
  TEST_DB_PASSWORD: z.string().optional(),
  TEST_DB_NAME: z.string().optional(),
  TEST_DB_PORT: z.string().default('5432'),
  
  // Test-specific Redis configuration
  TEST_REDIS_HOST: z.string().default('localhost'),
  TEST_REDIS_PORT: z.string().default('6379'),
  TEST_REDIS_PASSWORD: z.string().optional(),
  
  // Test feature flags
  TEST_ENABLE_ENHANCED_SEARCH: z.string().default('false'),
  TEST_ENABLE_AI_ANALYSIS: z.string().default('false'),
  TEST_ENABLE_ADVANCED_FILTERS: z.string().default('false'),
  TEST_ENABLE_VENDOR_FEATURES: z.string().default('false'),
  TEST_ENABLE_WISHLIST: z.string().default('false'),
  
  // Test cloud provider configuration (optional for integration tests)
  TEST_AWS_ACCESS_KEY_ID: z.string().optional(),
  TEST_AWS_SECRET_ACCESS_KEY: z.string().optional(),
  TEST_AWS_REGION: z.string().default('us-east-1'),
  TEST_GCP_PROJECT_ID: z.string().optional(),
  TEST_GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  
  // Test API configuration
  TEST_LOG_LEVEL: z.string().default('error'), // Reduce log noise in tests
  TEST_PORT: z.string().default('0'), // Use random port for tests
  
  // Test timeouts and limits
  TEST_DB_CONNECTION_TIMEOUT: z.string().default('5000'),
  TEST_API_TIMEOUT: z.string().default('30000'),
  
  // Node environment (should be 'test' in tests)
  NODE_ENV: z.literal('test').default('test'),
});

// Test-specific feature flags with proper typing
export const TEST_FEATURES = {
  ENHANCED_SEARCH: testEnvSchema.parse(process.env).TEST_ENABLE_ENHANCED_SEARCH === 'true',
  AI_ANALYSIS: testEnvSchema.parse(process.env).TEST_ENABLE_AI_ANALYSIS === 'true',
  ADVANCED_FILTERS: testEnvSchema.parse(process.env).TEST_ENABLE_ADVANCED_FILTERS === 'true',
  VENDOR_FEATURES: testEnvSchema.parse(process.env).TEST_ENABLE_VENDOR_FEATURES === 'true',
  WISHLIST: testEnvSchema.parse(process.env).TEST_ENABLE_WISHLIST === 'true',
} as const;

// Test feature flag utility
export const isTestFeatureEnabled = (feature: keyof typeof TEST_FEATURES): boolean => {
  return TEST_FEATURES[feature];
};

export default testEnvSchema.parse(process.env);