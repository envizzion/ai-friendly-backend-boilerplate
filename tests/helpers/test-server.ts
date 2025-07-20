import { Hono } from 'hono';
import { createCoreRouter } from '@routes/core.routes.js';
import type { Context } from 'hono';

// Create a test app instance
export function createTestApp() {
  const app = new Hono();
  
  // Add test middleware
  app.use('*', async (c: Context, next) => {
    // Add any test-specific middleware here
    c.set('testMode', true);
    await next();
  });

  // Mount routes
  app.route('/api/core', createCoreRouter());
  
  return app;
}

// Helper to create authenticated requests
export function createAuthenticatedRequest(userId: string = 'test-user-id') {
  return {
    headers: {
      'Authorization': `Bearer test-token-${userId}`,
      'Content-Type': 'application/json',
    },
  };
}

// Helper to extract response data
export async function getResponseData<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse response: ${text}`);
  }
}

// Create test app instance for reuse
export const testApp = createTestApp();