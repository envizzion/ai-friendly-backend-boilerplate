import { sql } from 'drizzle-orm';
import { boolean, decimal, integer, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Customer-specific enums
export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive', 'suspended']);
export const customerOrderStatusEnum = pgEnum('customer_order_status', ['cart', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']);
export const customerPaymentStatusEnum = pgEnum('customer_payment_status', ['pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled']);
export const addressTypeEnum = pgEnum('address_type', ['billing', 'shipping', 'both']);
export const wishlistPrivacyEnum = pgEnum('wishlist_privacy', ['private', 'public', 'friends']);

// ============================================
// CUSTOMER PROFILES & ACCOUNTS
// ============================================

// Customer profiles table
export const customerProfiles = pgTable('customer_profile', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Personal information
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 50 }),
    dateOfBirth: timestamp('date_of_birth'),
    
    // Account settings
    status: customerStatusEnum('status').default('active').notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    isPhoneVerified: boolean('is_phone_verified').default(false).notNull(),
    emailVerifiedAt: timestamp('email_verified_at'),
    
    // Preferences
    preferredLanguage: varchar('preferred_language', { length: 10 }).default('en'),
    preferredCurrency: varchar('preferred_currency', { length: 3 }).default('USD'),
    timezone: varchar('timezone', { length: 50 }).default('UTC'),
    
    // Marketing preferences
    acceptsMarketingEmails: boolean('accepts_marketing_emails').default(true).notNull(),
    acceptsSmsNotifications: boolean('accepts_sms_notifications').default(false).notNull(),
    
    // Customer metrics
    totalOrders: integer('total_orders').default(0),
    totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0.00'),
    averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }).default('0.00'),
    lastOrderDate: timestamp('last_order_date'),
    
    // Profile information
    profileImageId: uuid('profile_image_id'), // References core files via publicId
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
    uniqueEmail: sql`UNIQUE (${table.email})`,
}));

// Customer addresses table
export const customerAddresses = pgTable('customer_address', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Customer relationship
    customerId: integer('customer_id').references(() => customerProfiles.id, { onDelete: 'cascade' }).notNull(),
    
    // Address details
    type: addressTypeEnum('type').notNull(),
    label: varchar('label', { length: 100 }), // "Home", "Work", "Garage", etc.
    
    // Address information
    addressLine1: varchar('address_line1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    zipCode: varchar('zip_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 2 }).default('US').notNull(),
    
    // Contact information for this address
    contactName: varchar('contact_name', { length: 200 }),
    contactPhone: varchar('contact_phone', { length: 50 }),
    
    // Address settings
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    
    // Delivery instructions
    deliveryInstructions: text('delivery_instructions'),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    countryCheck: sql`CHECK (${table.country} ~ '^[A-Z]{2}$')`,
}));

// ============================================
// SHOPPING CART MANAGEMENT
// ============================================

// Shopping carts table
export const shoppingCarts = pgTable('shopping_cart', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Customer relationship
    customerId: integer('customer_id').references(() => customerProfiles.id, { onDelete: 'cascade' }).notNull(),
    
    // Cart status
    status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'abandoned', 'converted'
    isActive: boolean('is_active').default(true).notNull(),
    
    // Cart totals (computed from items)
    itemCount: integer('item_count').default(0).notNull(),
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).default('0.00'),
    
    // Cart session information
    sessionId: varchar('session_id', { length: 255 }),
    
    // Important dates
    lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
    abandonedAt: timestamp('abandoned_at'),
    convertedToOrderAt: timestamp('converted_to_order_at'),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueActiveCart: sql`UNIQUE (${table.customerId}) WHERE ${table.isActive} = true`,
}));

// Shopping cart items table
export const shoppingCartItems = pgTable('shopping_cart_item', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Relationships
    cartId: integer('cart_id').references(() => shoppingCarts.id, { onDelete: 'cascade' }).notNull(),
    
    // Vendor inventory reference (loose coupling via publicId)
    vendorInventoryPublicId: uuid('vendor_inventory_public_id').notNull(), // Links to vendor.vendorInventory.publicId
    
    // Item details
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(), // Price at time of adding to cart
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    
    // Item notes
    customerNotes: text('customer_notes'),
    
    // Audit fields
    addedAt: timestamp('added_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueCartItem: sql`UNIQUE (${table.cartId}, ${table.vendorInventoryPublicId})`,
    quantityCheck: sql`CHECK (${table.quantity} > 0)`,
    unitPriceCheck: sql`CHECK (${table.unitPrice} >= 0)`,
    totalPriceCheck: sql`CHECK (${table.totalPrice} >= 0)`,
}));

// ============================================
// CUSTOMER ORDERS
// ============================================

// Customer orders table
export const customerOrders = pgTable('customer_order', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Customer relationship
    customerId: integer('customer_id').references(() => customerProfiles.id).notNull(),
    
    // Order details
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    status: customerOrderStatusEnum('status').default('pending').notNull(),
    
    // Financial information
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0.00'),
    shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).default('0.00'),
    discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0.00'),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    
    // Payment information
    paymentStatus: customerPaymentStatusEnum('payment_status').default('pending').notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }),
    paymentReference: varchar('payment_reference', { length: 100 }),
    
    // Billing address (snapshot at time of order)
    billingAddressLine1: varchar('billing_address_line1', { length: 255 }),
    billingAddressLine2: varchar('billing_address_line2', { length: 255 }),
    billingCity: varchar('billing_city', { length: 100 }),
    billingState: varchar('billing_state', { length: 100 }),
    billingZipCode: varchar('billing_zip_code', { length: 20 }),
    billingCountry: varchar('billing_country', { length: 2 }).default('US'),
    
    // Shipping address (snapshot at time of order)
    shippingAddressLine1: varchar('shipping_address_line1', { length: 255 }),
    shippingAddressLine2: varchar('shipping_address_line2', { length: 255 }),
    shippingCity: varchar('shipping_city', { length: 100 }),
    shippingState: varchar('shipping_state', { length: 100 }),
    shippingZipCode: varchar('shipping_zip_code', { length: 20 }),
    shippingCountry: varchar('shipping_country', { length: 2 }).default('US'),
    
    // Shipping information
    shippingMethod: varchar('shipping_method', { length: 100 }),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    estimatedDeliveryDate: timestamp('estimated_delivery_date'),
    actualDeliveryDate: timestamp('actual_delivery_date'),
    
    // Order notes
    customerNotes: text('customer_notes'),
    internalNotes: text('internal_notes'),
    
    // Important dates
    orderDate: timestamp('order_date').defaultNow().notNull(),
    confirmedAt: timestamp('confirmed_at'),
    shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
    cancelledAt: timestamp('cancelled_at'),
    
    // Source tracking
    sourceCartId: integer('source_cart_id').references(() => shoppingCarts.id),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer order items table
export const customerOrderItems = pgTable('customer_order_item', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Relationships
    orderId: integer('order_id').references(() => customerOrders.id, { onDelete: 'cascade' }).notNull(),
    
    // Vendor and inventory references (snapshot at time of order)
    vendorProfilePublicId: uuid('vendor_profile_public_id').notNull(), // Links to vendor.vendorProfiles.publicId
    vendorInventoryPublicId: uuid('vendor_inventory_public_id').notNull(), // Links to vendor.vendorInventory.publicId
    corePartPublicId: uuid('core_part_public_id').notNull(), // Links to core.parts.publicId
    
    // Item details (snapshot at time of order)
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    
    // Product information snapshot
    partNumber: varchar('part_number', { length: 100 }).notNull(),
    partName: varchar('part_name', { length: 200 }).notNull(),
    vendorSku: varchar('vendor_sku', { length: 100 }),
    condition: varchar('condition', { length: 50 }).notNull(),
    
    // Item status
    status: varchar('status', { length: 50 }).default('pending'),
    
    // Fulfillment tracking
    vendorOrderPublicId: uuid('vendor_order_public_id'), // Links to vendor.vendorOrders.publicId when vendor order is created
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    quantityCheck: sql`CHECK (${table.quantity} > 0)`,
    unitPriceCheck: sql`CHECK (${table.unitPrice} >= 0)`,
    totalPriceCheck: sql`CHECK (${table.totalPrice} >= 0)`,
}));

// ============================================
// WISHLIST MANAGEMENT
// ============================================

// Customer wishlists table
export const customerWishlists = pgTable('customer_wishlist', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Customer relationship
    customerId: integer('customer_id').references(() => customerProfiles.id, { onDelete: 'cascade' }).notNull(),
    
    // Wishlist details
    name: varchar('name', { length: 200 }).notNull().default('My Wishlist'),
    description: text('description'),
    
    // Privacy settings
    privacy: wishlistPrivacyEnum('privacy').default('private').notNull(),
    
    // Wishlist status
    isActive: boolean('is_active').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    
    // Metrics
    itemCount: integer('item_count').default(0).notNull(),
    
    // Sharing
    shareToken: uuid('share_token').unique().default(sql`gen_random_uuid()`),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Wishlist items table
export const customerWishlistItems = pgTable('customer_wishlist_item', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Relationships
    wishlistId: integer('wishlist_id').references(() => customerWishlists.id, { onDelete: 'cascade' }).notNull(),
    
    // Part reference (loose coupling via publicId)
    corePartPublicId: uuid('core_part_public_id').notNull(), // Links to core.parts.publicId
    
    // Item details
    notes: text('notes'),
    priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high'
    
    // Price tracking
    targetPrice: decimal('target_price', { precision: 10, scale: 2 }),
    isInStock: boolean('is_in_stock').default(false).notNull(),
    lowestPrice: decimal('lowest_price', { precision: 10, scale: 2 }),
    lastPriceCheck: timestamp('last_price_check'),
    
    // Audit fields
    addedAt: timestamp('added_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueWishlistItem: sql`UNIQUE (${table.wishlistId}, ${table.corePartPublicId})`,
}));

// ============================================
// CUSTOMER SEARCH & ACTIVITY
// ============================================

// Customer search history table
export const customerSearchHistory = pgTable('customer_search_history', {
    id: serial('id').primaryKey(),
    
    // Customer relationship
    customerId: integer('customer_id').references(() => customerProfiles.id, { onDelete: 'cascade' }),
    
    // Search details
    searchTerm: varchar('search_term', { length: 500 }).notNull(),
    searchFilters: text('search_filters'), // JSON string of applied filters
    resultCount: integer('result_count').default(0),
    
    // Search context
    sessionId: varchar('session_id', { length: 255 }),
    userAgent: varchar('user_agent', { length: 500 }),
    
    // Search outcome
    clickedResults: integer('clicked_results').default(0),
    addedToCart: integer('added_to_cart').default(0),
    
    // Audit fields
    searchedAt: timestamp('searched_at').defaultNow().notNull(),
}, (table) => ({
    searchTermIndex: sql`CREATE INDEX IF NOT EXISTS idx_search_term ON ${table} (${table.searchTerm})`,
}));