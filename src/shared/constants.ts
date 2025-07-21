import env from './env.js';

const NODE_ENVIRONMENTS = {
  development: 'development',
  production: 'production',
};

const TRACING = 'tracing';

// Simple Feature Flags for Pre-Production Development
// Use centralized env configuration for type safety and validation
export const FEATURES = {
  // Enable enhanced search capabilities
  ENHANCED_SEARCH: env.ENABLE_ENHANCED_SEARCH === 'true',
  
  // Enable AI-powered part analysis
  AI_ANALYSIS: env.ENABLE_AI_ANALYSIS === 'true',
  
  // Enable advanced filtering in manufacturer API
  ADVANCED_FILTERS: env.ENABLE_ADVANCED_FILTERS === 'true',
  
  // Enable experimental vendor features
  VENDOR_FEATURES: env.ENABLE_VENDOR_FEATURES === 'true',
  
  // Enable customer wishlist functionality
  WISHLIST: env.ENABLE_WISHLIST === 'true',
} as const;

// Feature flag utility functions
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

export { NODE_ENVIRONMENTS, TRACING };
