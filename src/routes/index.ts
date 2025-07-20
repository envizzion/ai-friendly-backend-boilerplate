import { OpenAPIHono } from '@hono/zod-openapi';
import { coreApi } from './core.routes.js';
import { customerApi } from './customer.routes.js';
import { vendorApi } from './vendor.routes.js';
// TODO: Import shared features
// import { createFileUploadRouter } from '../features/common/file-upload/file-upload.routes.js';
// import { createAuthRouter } from '../features/common/auth/auth.routes.js';
// import { createAiAnalysisRouter } from '../features/common/ai-analysis/ai-analysis.routes.js';

/**
 * Main API Router
 * 
 * Aggregates all domain-specific routers and provides both:
 * - New domain-specific endpoints (/api/core, /api/vendor, /api/customer)
 * - Legacy endpoints for backward compatibility (/api/manufacturers, etc.)
 */
export function createMainRouter() {
    const api = new OpenAPIHono();

    // 🚀 NEW: Domain-specific API routes
    api.route('/core', coreApi);
    api.route('/vendor', vendorApi);
    api.route('/customer', customerApi);

    // TODO: Add legacy routes for other features as they are migrated
    // api.route('/models', createModelRouter());
    // api.route('/parts', createPartRouter());
    // api.route('/colors', createColorRouter());

    // TODO: Add shared feature routes
    // api.route('/files', createFileUploadRouter());
    // api.route('/auth', createAuthRouter());
    // api.route('/ai-analysis', createAiAnalysisRouter());

    return api;
}

// Export the main API router
export const api = createMainRouter();