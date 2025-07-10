import { createManufacturerRouter } from '@features/core/manufacturer/manufacturer.routes.js';
import { OpenAPIHono } from '@hono/zod-openapi';
import { healthRoutes } from './routes/health.js';

const api = new OpenAPIHono();

// ============================================
// CORE SECTION - Catalog Management
// ============================================
const core = new OpenAPIHono();

// Core catalog features (used by both vendors and customers)
core.route('/manufacturers', createManufacturerRouter());

// TODO: Add other core feature routes as they're migrated
// import { createModelRouter } from './features/core/model/model.routes';
// import { createPartRouter } from './features/core/part/part.routes';
// import { createPartAlternativeRouter } from './features/core/part-alternative/part-alternative.routes';
// import { createColorRouter } from './features/core/color/color.routes';
// import { createBodyStyleRouter } from './features/core/body-style/body-style.routes';

// core.route('/models', createModelRouter());
// core.route('/parts', createPartRouter());
// core.route('/part-alternatives', createPartAlternativeRouter());
// core.route('/colors', createColorRouter());
// core.route('/body-styles', createBodyStyleRouter());

// ============================================
// COMMON SECTION - Shared Services
// ============================================
const common = new OpenAPIHono();

// TODO: Add common feature routes as they're migrated
// import { createFileUploadRouter } from './features/common/file-upload/file-upload.routes';
// import { createAuthRouter } from './features/common/auth/auth.routes';
// import { createAiAnalysisRouter } from './features/common/ai-analysis/ai-analysis.routes';
// import { createImageAnalysisRouter } from './features/common/image-analysis/image-analysis.routes';

// common.route('/files', createFileUploadRouter());
// common.route('/auth', createAuthRouter());
// common.route('/ai-analysis', createAiAnalysisRouter());
// common.route('/image-analysis', createImageAnalysisRouter());

// ============================================
// VENDOR SECTION - Seller/Supplier Features  
// ============================================
const vendor = new OpenAPIHono();

// TODO: Vendor-specific features
// import { createVendorInventoryRouter } from './features/vendor/inventory/inventory.routes';
// import { createVendorListingRouter } from './features/vendor/listings/listings.routes';
// import { createVendorOrderRouter } from './features/vendor/orders/orders.routes';
// import { createVendorAnalyticsRouter } from './features/vendor/analytics/analytics.routes';
// import { createVendorProfileRouter } from './features/vendor/profile/profile.routes';

// vendor.route('/inventory', createVendorInventoryRouter());
// vendor.route('/listings', createVendorListingRouter());
// vendor.route('/orders', createVendorOrderRouter());
// vendor.route('/analytics', createVendorAnalyticsRouter());
// vendor.route('/profile', createVendorProfileRouter());

// ============================================
// CUSTOMER SECTION - Buyer Features
// ============================================
const customer = new OpenAPIHono();

// TODO: Customer-specific features  
// import { createProductSearchRouter } from './features/customer/search/search.routes';
// import { createShoppingCartRouter } from './features/customer/cart/cart.routes';
// import { createCustomerOrderRouter } from './features/customer/orders/orders.routes';
// import { createCustomerProfileRouter } from './features/customer/profile/profile.routes';
// import { createWishlistRouter } from './features/customer/wishlist/wishlist.routes';

// customer.route('/search', createProductSearchRouter());
// customer.route('/cart', createShoppingCartRouter());
// customer.route('/orders', createCustomerOrderRouter());
// customer.route('/profile', createCustomerProfileRouter());
// customer.route('/wishlist', createWishlistRouter());

// ============================================
// SYSTEM ROUTES - Health checks and monitoring
// ============================================
api.route('/', healthRoutes);

// ============================================
// REGISTER MAIN SECTIONS
// ============================================
api.route('/core', core);
api.route('/common', common);
api.route('/vendor', vendor);
api.route('/customer', customer);

export { api };
