import { OpenAPIHono } from '@hono/zod-openapi';
import { createManufacturerRouter } from '../features/core/manufacturer/manufacturer.routes.js';
// TODO: Import other core domain features as they are migrated
// import { createModelRouter } from '../features/core/model/model.routes.js';
// import { createPartRouter } from '../features/core/part/part.routes.js';
// import { createColorRouter } from '../features/core/color/color.routes.js';
// import { createBodyStyleRouter } from '../features/core/body-style/body-style.routes.js';

/**
 * Core Domain Router
 * 
 * Handles core business domain operations:
 * - Manufacturers
 * - Models  
 * - Parts
 * - Colors
 * - Body Styles
 * - Part Alternatives
 */
export function createCoreRouter() {
    const coreApi = new OpenAPIHono();

    // Core business domain routes with domain tagging
    coreApi.route('/manufacturers', createManufacturerRouter());
    
    // TODO: Add other core domain routes as features are migrated
    // coreApi.route('/models', createModelRouter());
    // coreApi.route('/parts', createPartRouter());
    // coreApi.route('/colors', createColorRouter());
    // coreApi.route('/body-styles', createBodyStyleRouter());

    return coreApi;
}

// Export the router instance
export const coreApi = createCoreRouter();