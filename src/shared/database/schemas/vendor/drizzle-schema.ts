import { sql } from 'drizzle-orm';
import { boolean, decimal, integer, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Vendor-specific enums
export const vendorStatusEnum = pgEnum('vendor_status', ['pending', 'active', 'suspended', 'inactive']);
export const businessTypeEnum = pgEnum('business_type', ['retailer', 'wholesaler', 'manufacturer', 'distributor', 'recycler']);
export const inventoryConditionEnum = pgEnum('inventory_condition', ['new', 'used', 'refurbished', 'core', 'damaged']);
export const orderStatusEnum = pgEnum('vendor_order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'partial', 'overdue', 'cancelled']);

// ============================================
// VENDOR PROFILE & BUSINESS INFO
// ============================================

// Vendor profiles table
export const vendorProfiles = pgTable('vendor_profile', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Business information
    businessName: varchar('business_name', { length: 200 }).notNull(),
    businessType: businessTypeEnum('business_type').notNull(),
    taxId: varchar('tax_id', { length: 50 }),
    businessLicense: varchar('business_license', { length: 100 }),
    
    // Contact information
    contactEmail: varchar('contact_email', { length: 255 }).notNull(),
    contactPhone: varchar('contact_phone', { length: 50 }),
    website: varchar('website', { length: 255 }),
    
    // Address information
    addressLine1: varchar('address_line1', { length: 255 }),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    zipCode: varchar('zip_code', { length: 20 }),
    country: varchar('country', { length: 2 }).default('US'),
    
    // Business settings
    businessDescription: text('business_description'),
    logoImageId: uuid('logo_image_id'), // References core files via publicId
    
    // Verification and status
    isVerified: boolean('is_verified').default(false).notNull(),
    status: vendorStatusEnum('status').default('pending').notNull(),
    verifiedAt: timestamp('verified_at'),
    verifiedBy: uuid('verified_by'),
    
    // Business metrics
    totalSales: decimal('total_sales', { precision: 12, scale: 2 }).default('0.00'),
    totalOrders: integer('total_orders').default(0),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
    reviewCount: integer('review_count').default(0),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
}, (table) => ({
    uniqueBusinessName: sql`UNIQUE (${table.businessName})`,
    uniqueContactEmail: sql`UNIQUE (${table.contactEmail})`,
    countryCheck: sql`CHECK (${table.country} ~ '^[A-Z]{2}$')`,
}));

// ============================================
// VENDOR INVENTORY MANAGEMENT
// ============================================

// Vendor inventory table
export const vendorInventory = pgTable('vendor_inventory', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Vendor relationship
    vendorId: integer('vendor_id').references(() => vendorProfiles.id, { onDelete: 'cascade' }).notNull(),
    
    // Core part reference (loose coupling via publicId)
    corePartPublicId: uuid('core_part_public_id').notNull(), // Links to core.parts.publicId
    
    // Inventory details
    sku: varchar('sku', { length: 100 }), // Vendor's internal SKU
    quantity: integer('quantity').default(0).notNull(),
    reservedQuantity: integer('reserved_quantity').default(0).notNull(), // For pending orders
    availableQuantity: integer('available_quantity').default(0).notNull(), // computed: quantity - reserved
    
    // Pricing
    cost: decimal('cost', { precision: 10, scale: 2 }), // Vendor's cost
    price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Selling price
    msrp: decimal('msrp', { precision: 10, scale: 2 }), // Manufacturer suggested retail price
    
    // Product condition and details
    condition: inventoryConditionEnum('condition').default('new').notNull(),
    conditionNotes: text('condition_notes'),
    
    // Location and storage
    warehouseLocation: varchar('warehouse_location', { length: 100 }),
    binLocation: varchar('bin_location', { length: 50 }),
    
    // Inventory management
    reorderLevel: integer('reorder_level').default(5).notNull(),
    reorderQuantity: integer('reorder_quantity').default(10).notNull(),
    lastRestockDate: timestamp('last_restock_date'),
    
    // Availability
    isAvailable: boolean('is_available').default(true).notNull(),
    isDiscontinued: boolean('is_discontinued').default(false).notNull(),
    availableFromDate: timestamp('available_from_date'),
    availableUntilDate: timestamp('available_until_date'),
    
    // Shipping information
    weight: decimal('weight', { precision: 8, scale: 2 }), // in kg
    dimensions: varchar('dimensions', { length: 50 }), // "L x W x H in cm"
    shippingClass: varchar('shipping_class', { length: 50 }),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
}, (table) => ({
    uniqueVendorSku: sql`UNIQUE (${table.vendorId}, ${table.sku})`,
    uniqueVendorPart: sql`UNIQUE (${table.vendorId}, ${table.corePartPublicId}, ${table.condition})`,
    quantityCheck: sql`CHECK (${table.quantity} >= 0)`,
    reservedQuantityCheck: sql`CHECK (${table.reservedQuantity} >= 0)`,
    availableQuantityCheck: sql`CHECK (${table.availableQuantity} >= 0)`,
    priceCheck: sql`CHECK (${table.price} >= 0)`,
}));

// ============================================
// VENDOR ORDERS & TRANSACTIONS
// ============================================

// Vendor orders table (orders placed with vendors)
export const vendorOrders = pgTable('vendor_order', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Order relationships
    vendorId: integer('vendor_id').references(() => vendorProfiles.id).notNull(),
    customerProfilePublicId: uuid('customer_profile_public_id'), // Links to customer.customerProfiles.publicId
    
    // Order details
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    status: orderStatusEnum('status').default('pending').notNull(),
    
    // Financial information
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0.00'),
    shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).default('0.00'),
    discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0.00'),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    
    // Payment information
    paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }),
    paymentReference: varchar('payment_reference', { length: 100 }),
    
    // Shipping information
    shippingMethod: varchar('shipping_method', { length: 100 }),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    estimatedDeliveryDate: timestamp('estimated_delivery_date'),
    actualDeliveryDate: timestamp('actual_delivery_date'),
    
    // Address information
    shippingAddressLine1: varchar('shipping_address_line1', { length: 255 }),
    shippingAddressLine2: varchar('shipping_address_line2', { length: 255 }),
    shippingCity: varchar('shipping_city', { length: 100 }),
    shippingState: varchar('shipping_state', { length: 100 }),
    shippingZipCode: varchar('shipping_zip_code', { length: 20 }),
    shippingCountry: varchar('shipping_country', { length: 2 }).default('US'),
    
    // Order notes and communication
    customerNotes: text('customer_notes'),
    vendorNotes: text('vendor_notes'),
    internalNotes: text('internal_notes'),
    
    // Important dates
    orderDate: timestamp('order_date').defaultNow().notNull(),
    confirmedAt: timestamp('confirmed_at'),
    shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
    cancelledAt: timestamp('cancelled_at'),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
});

// Vendor order items table
export const vendorOrderItems = pgTable('vendor_order_item', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    
    // Relationships
    orderId: integer('order_id').references(() => vendorOrders.id, { onDelete: 'cascade' }).notNull(),
    inventoryId: integer('inventory_id').references(() => vendorInventory.id).notNull(),
    
    // Item details
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    
    // Item status
    status: varchar('status', { length: 50 }).default('pending'),
    
    // Audit fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    quantityCheck: sql`CHECK (${table.quantity} > 0)`,
    unitPriceCheck: sql`CHECK (${table.unitPrice} >= 0)`,
    totalPriceCheck: sql`CHECK (${table.totalPrice} >= 0)`,
}));

// ============================================
// VENDOR ANALYTICS & REPORTING
// ============================================

// Vendor analytics snapshots (daily/weekly/monthly aggregates)
export const vendorAnalytics = pgTable('vendor_analytics', {
    id: serial('id').primaryKey(),
    
    // Vendor relationship
    vendorId: integer('vendor_id').references(() => vendorProfiles.id, { onDelete: 'cascade' }).notNull(),
    
    // Time period
    period: varchar('period', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
    periodDate: timestamp('period_date').notNull(), // Start date of the period
    
    // Sales metrics
    totalSales: decimal('total_sales', { precision: 12, scale: 2 }).default('0.00'),
    totalOrders: integer('total_orders').default(0),
    averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }).default('0.00'),
    
    // Inventory metrics
    totalInventoryItems: integer('total_inventory_items').default(0),
    totalInventoryValue: decimal('total_inventory_value', { precision: 15, scale: 2 }).default('0.00'),
    lowStockItems: integer('low_stock_items').default(0),
    
    // Customer metrics
    newCustomers: integer('new_customers').default(0),
    returningCustomers: integer('returning_customers').default(0),
    
    // Product performance
    topSellingPartPublicId: uuid('top_selling_part_public_id'),
    topSellingPartQuantity: integer('top_selling_part_quantity').default(0),
    
    // Created timestamp
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniquePeriod: sql`UNIQUE (${table.vendorId}, ${table.period}, ${table.periodDate})`,
}));