import { OpenAPIHono } from '@hono/zod-openapi';
// TODO: Import customer domain features as they are migrated
// import { createCartRouter } from '../features/customer/cart/cart.routes.js';
// import { createOrderRouter } from '../features/customer/order/order.routes.js';
// import { createSearchRouter } from '../features/customer/search/search.routes.js';

/**
 * Customer Domain Router
 * 
 * Handles customer shopping operations:
 * - Shopping cart management
 * - Order processing
 * - Product search
 * - User preferences
 * - Wishlist management
 */
export function createCustomerRouter() {
    const customerApi = new OpenAPIHono();

    // TODO: Add customer domain routes as features are migrated
    // customerApi.route('/cart', createCartRouter());
    // customerApi.route('/orders', createOrderRouter());
    // customerApi.route('/search', createSearchRouter());

    return customerApi;
}

// Export the router instance
export const customerApi = createCustomerRouter();