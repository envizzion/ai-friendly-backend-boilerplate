import {
    AUDIT_ACTIONS,
    BODY_STYLE_CATEGORIES,
    BODY_STYLE_CODES,
    DRIVETRAIN_TYPES,
    EQUIPMENT_LEVELS,
    FUEL_TYPES,
    MARKET_REGIONS,
    TRANSMISSION_TYPES,
    TRIM_LEVELS,
    VEHICLE_SEGMENTS,
    VEHICLE_STATUS,
} from '@shared/types/enums.ts';
import { sql } from 'drizzle-orm';
import {
    boolean,
    char,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

// Enum definitions using shared constants
export const fuelTypeEnum = pgEnum('fuel_type', FUEL_TYPES);
export const bodyStyleCodeEnum = pgEnum('body_style_code', BODY_STYLE_CODES);
export const marketRegionEnum = pgEnum('market_region', MARKET_REGIONS);
export const vehicleStatusEnum = pgEnum('vehicle_status', VEHICLE_STATUS);
export const transmissionTypeEnum = pgEnum('transmission_type', TRANSMISSION_TYPES);
export const drivetrainTypeEnum = pgEnum('drivetrain_type', DRIVETRAIN_TYPES);
export const vehicleSegmentEnum = pgEnum('vehicle_segment', VEHICLE_SEGMENTS);
export const trimLevelEnum = pgEnum('trim_level', TRIM_LEVELS);
export const equipmentLevelEnum = pgEnum('equipment_level', EQUIPMENT_LEVELS);
export const bodyStyleCategoryEnum = pgEnum('body_style_category', BODY_STYLE_CATEGORIES);
export const auditActionEnum = pgEnum('audit_action', AUDIT_ACTIONS);

// ============================================
// CORE SYSTEM TABLES
// ============================================

// Users table
export const users = pgTable('user', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    resetToken: varchar('reset_token', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// File uploads table for storing uploaded file metadata
export const files = pgTable('file', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(),
    filePath: varchar('file_path', { length: 500 }).notNull(),
    bucket: varchar('bucket', { length: 100 }).notNull(),
    provider: varchar('provider', { length: 50 }).notNull(),
    uploadedBy: integer('uploaded_by').references(() => users.id),
    tags: text('tags').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// CORE CATALOG TABLES
// ============================================

// Manufacturers table
export const manufacturers = pgTable(
    'manufacturer',
    {
        id: serial('id').primaryKey(),
        publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),

        // Core fields
        name: varchar('name', { length: 100 }).notNull().unique(),
        displayName: varchar('display_name', { length: 100 }).notNull(),
        slug: varchar('slug', { length: 100 }).notNull().unique(),

        // Metadata
        logoImageId: integer('logo_image_id').references(() => files.id),
        countryCode: char('country_code', { length: 2 }),
        description: text('description'),

        // Business fields
        isActive: boolean('is_active').default(true).notNull(),
        isVerified: boolean('is_verified').default(false).notNull(),

        // Audit fields
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
        createdBy: uuid('created_by'),
        updatedBy: uuid('updated_by'),
    },
    (table) => ({
        countryCodeCheck: sql`CHECK (${table.countryCode} ~ '^[A-Z]{2}$')`,
    }),
);

// Models table
export const models = pgTable(
    'model',
    {
        id: serial('id').primaryKey(),
        publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
        manufacturerId: integer('manufacturer_id')
            .references(() => manufacturers.id, { onDelete: 'cascade' })
            .notNull(),

        // Core fields
        name: varchar('name', { length: 200 }).notNull(),
        displayName: varchar('display_name', { length: 200 }).notNull(),
        slug: varchar('slug', { length: 200 }).notNull(),
        modelCode: varchar('model_code', { length: 50 }), //Internal manufacturer code

        // Classification
        vehicleType: bodyStyleCodeEnum('vehicle_type').notNull(),
        segment: vehicleSegmentEnum('segment'), // A, B, C, D, E, F segments or motorcycle categories

        // Production info
        generation: varchar('generation', { length: 50 }), // e.g., "Mk VII", "Gen 3", "F30"
        platform: varchar('platform', { length: 50 }), // Shared platform code
        productionStart: integer('production_start'),
        productionEnd: integer('production_end'),

        // Market presence
        primaryMarkets: marketRegionEnum('primary_markets').array().notNull().default(sql`ARRAY[]::market_region[]`),

        // Status
        status: vehicleStatusEnum('status').default('Active').notNull(),

        // Metadata
        description: text('description'),

        // Audit fields
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
        createdBy: uuid('created_by'),
        updatedBy: uuid('updated_by'),
    },
    (table) => ({
        uniqueModelPerManufacturer: sql`UNIQUE (${table.manufacturerId}, ${table.name}, ${table.generation})`,
        productionYearsCheck: sql`CHECK (${table.productionEnd} IS NULL OR ${table.productionEnd} >= ${table.productionStart})`,
        productionStartCheck: sql`CHECK (${table.productionStart} IS NULL OR ${table.productionStart} >= 1900)`,
        productionEndCheck: sql`CHECK (${table.productionEnd} IS NULL OR ${table.productionEnd} >= 1900)`,
    }),
);

// Body styles reference table
export const bodyStyles = pgTable('body_style', {
    id: serial('id').primaryKey(),
    code: bodyStyleCodeEnum('code').notNull().unique(),
    name: varchar('name', { length: 50 }).notNull(),
    category: bodyStyleCategoryEnum('category').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Colors reference table
export const colors = pgTable(
    'color',
    {
        id: serial('id').primaryKey(),
        oemCode: varchar('oem_code', { length: 50 }).notNull(),
        name: varchar('name', { length: 100 }).notNull(),
        hexValue: char('hex_value', { length: 7 }),
        rgbValues: integer('rgb_values').array(),
        manufacturerId: integer('manufacturer_id').references(() => manufacturers.id),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => ({
        uniqueColorPerManufacturer: sql`UNIQUE (${table.manufacturerId}, ${table.oemCode})`,
        hexValueCheck: sql`CHECK (${table.hexValue} ~ '^#[0-9A-F]{6}$')`,
    }),
);

// Model variations table
export const modelVariations = pgTable(
    'model_variation',
    {
        id: serial('id').primaryKey(),
        publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
        modelId: integer('model_id')
            .references(() => models.id, { onDelete: 'cascade' })
            .notNull(),

        // Identification
        name: varchar('name', { length: 300 }).notNull(), // e.g., "Civic Si Sedan"
        variantCode: varchar('variant_code', { length: 100 }), // Manufacturer's internal variant code
        modelYear: integer('model_year').notNull(), // e.g., 2024, 2025

        // Key specifications for parts matching
        fuelType: fuelTypeEnum('fuel_type').notNull(),
        bodyStyleId: integer('body_style_id').references(() => bodyStyles.id),
        transmissionType: transmissionTypeEnum('transmission_type'),
        drivetrain: drivetrainTypeEnum('drivetrain'), // FWD, RWD, AWD, 4WD

        // Market and region
        marketRegion: marketRegionEnum('market_region').notNull(),
        countrySpecific: char('country_specific', { length: 2 }).array(), // Specific country restrictions within region

        // Engine basic info (for ICE/Hybrid)
        engineCode: varchar('engine_code', { length: 50 }),
        engineDisplacement: integer('engine_displacement'), // in CC

        // Trim and equipment
        trimLevel: trimLevelEnum('trim_level'), // Base, Sport, Limited, etc.
        equipmentLevel: equipmentLevelEnum('equipment_level'), // Standard, Premium, Luxury

        // VIN mapping support
        vinPattern: varchar('vin_pattern', { length: 17 }), // Regex pattern for VIN matching
        wmiCode: varchar('wmi_code', { length: 3 }), // World Manufacturer Identifier

        // Visual
        defaultColorId: integer('default_color_id').references(() => colors.id),

        // Status and metadata
        status: vehicleStatusEnum('status').default('Active').notNull(),
        isSpecialEdition: boolean('is_special_edition').default(false).notNull(),
        limitedProduction: boolean('limited_production').default(false).notNull(),
        productionNumber: integer('production_number'), // For limited editions

        // Parts catalog support
        partsCatalogCode: varchar('parts_catalog_code', { length: 100 }), // Manufacturer's internal part catalog code
        hasUniqueParts: boolean('has_unique_parts').default(false).notNull(),

        // Audit fields
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
        createdBy: uuid('created_by'),
        updatedBy: uuid('updated_by'),
        revision: integer('revision').default(1).notNull(),

        // Soft delete support
        deletedAt: timestamp('deleted_at'),
        deletedBy: uuid('deleted_by'),
    },
    (table) => ({
        uniqueVariation: sql`UNIQUE (${table.modelId}, ${table.name}, ${table.modelYear}, ${table.marketRegion}, ${table.trimLevel})`,
        modelYearCheck: sql`CHECK (${table.modelYear} >= 1900)`,
        countrySpecificCheck: sql`CHECK (${table.countrySpecific} IS NULL OR array_length(${table.countrySpecific}, 1) > 0)`,
    }),
);

// VIN prefix mapping for fast lookups
export const vinPrefixes = pgTable('vin_prefix', {
    id: serial('id').primaryKey(),
    variationId: integer('variation_id')
        .references(() => modelVariations.id, { onDelete: 'cascade' })
        .notNull(),
    prefix: varchar('prefix', { length: 11 }).notNull().unique(),
    prefixLength: integer('prefix_length'),
    description: varchar('description', { length: 200 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PARTS CATALOG TABLES
// ============================================

// Part names table
export const partNames = pgTable('part_name', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 200 }).notNull().unique(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Part categories table
export const partCategories = pgTable('part_category', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 200 }).notNull().unique(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories for model variations (base table)
export const modelVariationCategories = pgTable('model_variation_category', {
    id: serial('id').primaryKey(),
    categoryId: integer('category_id')
        .references(() => partCategories.id)
        .notNull(),
    majorGroupId: varchar('major_group_id', { length: 50 }),
    fileId: integer('file_id').references(() => files.id),
    partListImageId: integer('part_list_image_id').references(() => files.id),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    displayOrder: integer('display_order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Junction table for many-to-many relationship
export const modelVariationToCategory = pgTable(
    'model_variation_to_category',
    {
        modelVariationId: integer('model_variation_id')
            .references(() => modelVariations.id)
            .notNull(),
        categoryId: integer('category_id')
            .references(() => modelVariationCategories.id)
            .notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => {
        return {
            pk: sql`PRIMARY KEY (${table.modelVariationId}, ${table.categoryId})`,
        };
    },
);

// Parts table
export const parts = pgTable('part', {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
    partNameId: integer('part_name_id')
        .references(() => partNames.id)
        .notNull(),
    partNumber: varchar('part_number', { length: 100 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Category parts relationship with coordinates
export const categoryParts = pgTable('category_part', {
    id: serial('id').primaryKey(),
    modelVariationCategoryId: integer('model_variation_category_id')
        .references(() => modelVariationCategories.id)
        .notNull(),
    partId: integer('part_id')
        .references(() => parts.id)
        .notNull(),
    referenceNumber: integer('reference_number').notNull(),
    referenceLabel: varchar('reference_label', { length: 50 }).notNull(),
    coordinates: jsonb('coordinates').notNull(), // Store as JSONB for better querying
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Part alternatives table
export const partAlternatives = pgTable(
    'part_alternative',
    {
        originalPartId: integer('original_part_id')
            .references(() => parts.id)
            .notNull(),
        alternativePartId: integer('alternative_part_id')
            .references(() => parts.id)
            .notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => {
        return {
            uniqueAlternative: sql`UNIQUE (${table.originalPartId}, ${table.alternativePartId})`,
        };
    },
);

// Tags table (shared across sections)
export const tags = pgTable('tag', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    color: varchar('color', { length: 7 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Part tags junction table
export const partTags = pgTable(
    'part_tag',
    {
        partId: integer('part_id')
            .references(() => parts.id)
            .notNull(),
        tagId: integer('tag_id')
            .references(() => tags.id)
            .notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => {
        return {
            pk: sql`PRIMARY KEY (${table.partId}, ${table.tagId})`,
        };
    },
);

// ============================================
// AUDIT LOG TABLE
// ============================================
export const vehicleHierarchyAudit = pgTable('vehicle_hierarchy_audit', {
    id: serial('id').primaryKey(),
    tableName: varchar('table_name', { length: 50 }).notNull(),
    recordId: integer('record_id').notNull(),
    action: auditActionEnum('action').notNull(),
    changedData: jsonb('changed_data').notNull(),
    changedBy: uuid('changed_by').notNull(),
    changedAt: timestamp('changed_at').defaultNow().notNull(),
});
