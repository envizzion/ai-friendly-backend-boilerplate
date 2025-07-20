import { OpenAPIHono } from '@hono/zod-openapi';
// TODO: Import vendor domain features as they are migrated
// import { createInventoryRouter } from '../features/vendor/inventory/inventory.routes.js';
// import { createListingRouter } from '../features/vendor/listing/listing.routes.js';

/**
 * Vendor Domain Router
 * 
 * Handles vendor marketplace operations:
 * - Inventory management
 * - Product listings
 * - Vendor profiles
 * - Marketplace features
 */
export function createVendorRouter() {
    const vendorApi = new OpenAPIHono();

    // TODO: Add vendor domain routes as features are migrated
    // vendorApi.route('/inventory', createInventoryRouter());
    // vendorApi.route('/listings', createListingRouter());

    return vendorApi;
}

// Export the router instance
export const vendorApi = createVendorRouter();