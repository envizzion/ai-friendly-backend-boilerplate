# Database Structure Reorganization for Feature-Based Architecture

## 🎯 Overview

This document outlines the strategy for reorganizing the database structure to align with our new feature-based architecture using **separate schema + generated files per section**. This approach maintains the proven Drizzle + Kysely pattern while ensuring complete isolation between sections.

## 📊 Current State Analysis

### Existing Structure
- **Single Schema File**: `drizzle-schema.ts` (357 lines) - contains all table definitions
- **Single Types File**: `generated.ts` (289 lines) - contains all Kysely interfaces
- **Pattern**: Drizzle for schema definition → Kysely codegen → TypeScript interfaces

### Current Tables by Category
```typescript
// Core catalog tables (6) - KEEP IN CORE
manufacturers, models, modelVariations, bodyStyles, colors, vinPrefixes

// Parts management tables (8) - KEEP IN CORE
partNames, partCategories, modelVariationCategories, modelVariationToCategory, 
parts, categoryParts, partAlternatives, partTags

// Business operation tables (3) - MOVE TO VENDOR
inventory, tags, vehicleHierarchyAudit

// System tables (3) - KEEP IN CORE  
users, files
```

## 🎯 Proposed Section-Based Database Organization

### 1. Database Structure - Section-Based Schemas, Unified Migrations
```
src/shared/database/
├── schemas/
│   ├── core/
│   │   ├── drizzle-schema.ts       # ✅ EXISTING - keep as-is
│   │   └── kysely-types.ts         # ✅ EXISTING - renamed from generated.ts
│   ├── vendor/
│   │   ├── drizzle-schema.ts       # 🆕 NEW - vendor-specific tables
│   │   └── kysely-types.ts         # 🆕 NEW - vendor Kysely types
│   └── customer/
│       ├── drizzle-schema.ts       # 🆕 NEW - customer-specific tables
│       └── kysely-types.ts         # 🆕 NEW - customer Kysely types
├── migrations/                     # 📁 SINGLE migrations directory
│   ├── 0001_initial_core.sql       # Existing core migrations
│   ├── 0002_add_vendor_tables.sql  # New vendor tables
│   └── 0003_add_customer_tables.sql # New customer tables
└── connections/
    ├── core.ts                     # Core DB connection
    ├── vendor.ts                   # Vendor DB connection  
    └── customer.ts                 # Customer DB connection
```

### 2. Section-Specific Generated Types
```typescript
// Each section has completely isolated types

// Core Section (existing)
interface CoreDB {
  manufacturer: Manufacturer;
  model: Model;
  modelVariation: ModelVariation;
  part: Part;
  partCategory: PartCategory;
  color: Color;
  bodyStyle: BodyStyle;
  user: User;
  file: File;
  // ... all existing core tables
}

// Vendor Section (new)
interface VendorDB {
  vendorProfile: VendorProfile;
  vendorInventory: VendorInventory;
  vendorOrders: VendorOrders;
  vendorAnalytics: VendorAnalytics;
  // ... vendor-specific tables only
}

// Customer Section (new)  
interface CustomerDB {
  customerProfile: CustomerProfile;
  shoppingCart: ShoppingCart;
  customerOrders: CustomerOrders;
  wishlist: Wishlist;
  // ... customer-specific tables only
}
```

## 🔧 Implementation Strategy

### Phase 1: Create New Section Schemas (Zero Risk)

#### 1. Core Schema (Keep Existing)
```typescript
// src/shared/database/core/drizzle-schema.ts
// ✅ NO CHANGES - Keep existing file exactly as-is
// Contains: manufacturers, models, parts, users, files, etc.
// This preserves all existing functionality
```

#### 2. New Vendor Schema
```typescript
// src/shared/database/vendor/drizzle-schema.ts
import { pgTable, serial, uuid, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Vendor profile table
export const vendorProfiles = pgTable('vendor_profile', {
  id: serial('id').primaryKey(),
  publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
  businessName: varchar('business_name', { length: 200 }).notNull(),
  businessType: varchar('business_type', { length: 50 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vendor inventory table
export const vendorInventory = pgTable('vendor_inventory', {
  id: serial('id').primaryKey(),
  publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
  vendorId: integer('vendor_id').references(() => vendorProfiles.id).notNull(),
  
  // Reference to core parts via public ID (loose coupling)
  corePartPublicId: uuid('core_part_public_id').notNull(),
  
  quantity: integer('quantity').default(0).notNull(),
  price: varchar('price', { length: 20 }).notNull(),
  location: varchar('location', { length: 100 }),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### 3. New Customer Schema
```typescript
// src/shared/database/customer/drizzle-schema.ts
import { pgTable, serial, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Customer profile table
export const customerProfiles = pgTable('customer_profile', {
  id: serial('id').primaryKey(),
  publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Shopping cart table
export const shoppingCarts = pgTable('shopping_cart', {
  id: serial('id').primaryKey(),
  publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
  customerId: integer('customer_id').references(() => customerProfiles.id).notNull(),
  
  // Reference to vendor inventory via public ID (loose coupling)
  vendorInventoryPublicId: uuid('vendor_inventory_public_id').notNull(),
  
  quantity: integer('quantity').notNull(),
  priceAtAdd: varchar('price_at_add', { length: 20 }).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});
```

### Phase 2: Create Section-Specific Database Connections

#### 1. Core Connection (Updated)
```typescript
// src/shared/database/connections/core.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schemas/core/drizzle-schema';

const coreClient = postgres(process.env.DATABASE_URL!); // Same database
export const coreDb = drizzle(coreClient, { schema });

export type CoreDB = typeof coreDb;
```

#### 2. Vendor Connection (New)
```typescript
// src/shared/database/connections/vendor.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schemas/vendor/drizzle-schema';

const vendorClient = postgres(process.env.DATABASE_URL!); // Same database
export const vendorDb = drizzle(vendorClient, { schema });

export type VendorDB = typeof vendorDb;
```

#### 3. Customer Connection (New)
```typescript
// src/shared/database/connections/customer.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schemas/customer/drizzle-schema';

const customerClient = postgres(process.env.DATABASE_URL!); // Same database
export const customerDb = drizzle(customerClient, { schema });

export type CustomerDB = typeof customerDb;
```

### Phase 3: Generate Types for Each Section

#### 1. Generate Core Types (Updated)
```bash
# Generate types for core schema only
npx kysely-codegen --out-file src/shared/database/schemas/core/kysely-types.ts --url $DATABASE_URL --include-pattern "manufacturer|model|part|user|file|color|body_style|vin_prefix|vehicle_hierarchy_audit|part_*|model_variation*"
```

#### 2. Generate Vendor Types (New)
```bash
# Generate types for vendor tables only
npx kysely-codegen --out-file src/shared/database/schemas/vendor/kysely-types.ts --url $DATABASE_URL --include-pattern "vendor_*"
```

#### 3. Generate Customer Types (New)
```bash
# Generate types for customer tables only
npx kysely-codegen --out-file src/shared/database/schemas/customer/kysely-types.ts --url $DATABASE_URL --include-pattern "customer_*|shopping_*|wishlist*"
```

### Phase 4: Update Repository Pattern

#### 1. Core Repository (Minimal Changes)
```typescript
// src/features/core/manufacturer/manufacturer.repository.ts
import { Kysely } from 'kysely';
import type { DB } from '../../../shared/database/schemas/core/kysely-types'; // Updated path

export class ManufacturerRepository {
  constructor(private db: Kysely<DB>) {}
  
  // All existing methods stay exactly the same
  async findByPublicId(publicId: string) {
    return await this.db
      .selectFrom('manufacturer')
      .selectAll()
      .where('publicId', '=', publicId)
      .executeTakeFirst();
  }
}
```

#### 2. Vendor Repository (New)
```typescript
// src/features/vendor/inventory/inventory.repository.ts
import { Kysely } from 'kysely';
import type { DB } from '../../../shared/database/schemas/vendor/kysely-types'; // Uses vendor types only

export class VendorInventoryRepository {
  constructor(private db: Kysely<DB>) {}
  
  async findByVendorId(vendorId: number) {
    return await this.db
      .selectFrom('vendorInventory')
      .selectAll()
      .where('vendorId', '=', vendorId)
      .execute();
  }
  
  async findByCorePartPublicId(corePartPublicId: string) {
    return await this.db
      .selectFrom('vendorInventory')
      .selectAll()
      .where('corePartPublicId', '=', corePartPublicId)
      .execute();
  }
}
```

#### 3. Customer Repository (New)
```typescript
// src/features/customer/cart/cart.repository.ts
import { Kysely } from 'kysely';
import type { DB } from '../../../shared/database/schemas/customer/kysely-types'; // Uses customer types only

export class ShoppingCartRepository {
  constructor(private db: Kysely<DB>) {}
  
  async findByCustomerId(customerId: number) {
    return await this.db
      .selectFrom('shoppingCart')
      .selectAll()
      .where('customerId', '=', customerId)
      .execute();
  }
}
```

## 🎯 Migration Benefits

### 1. Complete Section Isolation
- **Zero Risk**: Existing core schema remains completely unchanged
- **Independent Evolution**: Each section can evolve without affecting others
- **Clear Ownership**: Each section has its own schema + types + migrations
- **No Breaking Changes**: All existing APIs continue working

### 2. AI-Friendly Development
```typescript
// Crystal clear AI prompts:
"Add inventory table to vendor schema"     → vendor/drizzle-schema.ts
"Create shopping cart in customer schema"  → customer/drizzle-schema.ts  
"Update manufacturer in core schema"       → core/drizzle-schema.ts
```

### 3. Cross-Section Data Access
```typescript
// Services can access multiple sections via dependency injection
export class VendorInventoryService {
  constructor(
    private vendorRepo: VendorInventoryRepository,  // Vendor DB
    private corePartRepo: PartRepository           // Core DB
  ) {}
  
  async getInventoryWithPartDetails(vendorId: number) {
    const inventory = await this.vendorRepo.findByVendorId(vendorId);
    
    const enriched = await Promise.all(
      inventory.map(async (item) => {
        const part = await this.corePartRepo.findByPublicId(item.corePartPublicId);
        return { ...item, partDetails: part };
      })
    );
    
    return enriched;
  }
}
```

### 4. Perfect Scalability
- **Independent Development**: Teams can work on different sections in parallel
- **Future Microservices**: Easy to split into separate services later
- **Database Flexibility**: Can use different databases per section if needed
- **Team Boundaries**: Clear ownership and responsibility boundaries

## 🚧 Implementation Steps

### Step 1: Create Vendor Schema Section (Week 1)
1. Create `src/shared/database/schemas/vendor/` folder structure
2. Create `vendor/drizzle-schema.ts` with vendor-specific tables
3. Set up vendor database connection (same DB, vendor schema)
4. Generate vendor types: `vendor/kysely-types.ts`
5. Create unified migration for vendor tables
6. Test vendor schema independently

### Step 2: Create Customer Schema Section (Week 2)
1. Create `src/shared/database/schemas/customer/` folder structure
2. Create `customer/drizzle-schema.ts` with customer-specific tables
3. Set up customer database connection (same DB, customer schema)
4. Generate customer types: `customer/kysely-types.ts`
5. Create unified migration for customer tables
6. Test customer schema independently

### Step 3: Implement Vendor Features (Week 3)
1. Create vendor repositories using vendor types
2. Implement vendor services with cross-section data access
3. Build vendor API endpoints
4. Test vendor functionality end-to-end

### Step 4: Implement Customer Features (Week 4)
1. Create customer repositories using customer types
2. Implement customer services with cross-section data access
3. Build customer API endpoints
4. Test customer functionality end-to-end

### Step 5: Configuration & Documentation (Week 5)
1. Set up separate Drizzle configs for each section
2. Document cross-section reference patterns
3. Create development workflow guidelines
4. Update environment configuration

## 📋 Database Change Workflow

### Adding Tables to Existing Section
```bash
# 1. Add table to appropriate section schema
# Edit: src/shared/database/schemas/vendor/drizzle-schema.ts

# 2. Generate new types for that section
npx kysely-codegen --out-file src/shared/database/schemas/vendor/kysely-types.ts --include-pattern "vendor_*"

# 3. Create and run unified migration
npx drizzle-kit generate --config=drizzle.config.ts
npx drizzle-kit migrate --config=drizzle.config.ts
```

### Cross-Section References (Loose Coupling)
```typescript
// Use public IDs for cross-section references
export const vendorInventory = pgTable('vendor_inventory', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendorProfiles.id).notNull(),
  
  // Reference core parts via public ID (not foreign key)
  corePartPublicId: uuid('core_part_public_id').notNull(),
  
  quantity: integer('quantity').notNull(),
  // ... other fields
});

// Customer cart references vendor inventory
export const shoppingCarts = pgTable('shopping_cart', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customerProfiles.id).notNull(),
  
  // Reference vendor inventory via public ID (not foreign key)
  vendorInventoryPublicId: uuid('vendor_inventory_public_id').notNull(),
  
  quantity: integer('quantity').notNull(),
  // ... other fields
});
```

### Configuration Files
```typescript
// drizzle.config.ts (unified configuration)
export default {
  schema: [
    './src/shared/database/schemas/core/drizzle-schema.ts',
    './src/shared/database/schemas/vendor/drizzle-schema.ts', 
    './src/shared/database/schemas/customer/drizzle-schema.ts'
  ],
  out: './src/shared/database/migrations', // Single migrations directory
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! }, // Single database
};
```

### Kysely Type Generation Scripts
```json
// package.json scripts
{
  "scripts": {
    "db:generate-core-types": "kysely-codegen --out-file src/shared/database/schemas/core/kysely-types.ts --include-pattern 'manufacturer|model|part|user|file|color|body_style|vin_prefix|vehicle_hierarchy_audit|part_*|model_variation*'",
    "db:generate-vendor-types": "kysely-codegen --out-file src/shared/database/schemas/vendor/kysely-types.ts --include-pattern 'vendor_*'",
    "db:generate-customer-types": "kysely-codegen --out-file src/shared/database/schemas/customer/kysely-types.ts --include-pattern 'customer_*|shopping_*|wishlist*'",
    "db:generate-all-types": "npm run db:generate-core-types && npm run db:generate-vendor-types && npm run db:generate-customer-types"
  }
}
```

## 🎉 Expected Outcomes

### For Developers
- **Clearer Structure**: Know exactly where database code lives
- **Faster Development**: Only load relevant schema parts
- **Better Testing**: Mock minimal database surface area

### For AI Development  
- **Precise Targeting**: AI knows exactly which schema files to modify
- **Pattern Consistency**: Same structure across all features
- **Type Safety**: AI gets compile-time feedback on database queries

### For Team Scaling
- **Clear Ownership**: Teams own specific schema sections
- **Independent Work**: Features can evolve database independently  
- **Reduced Conflicts**: Schema changes isolated to feature boundaries

This section-based approach maintains the proven Drizzle + Kysely pattern while providing complete isolation, zero risk to existing functionality, and perfect scalability for both humans and AI assistants! 🚀

## 🎉 Why This Approach is Perfect

### ✅ **Zero Risk**
- Core schema and functionality remain completely unchanged
- Single database with unified migrations
- All current APIs continue working exactly as before
- No database connection complexity

### ✅ **Complete Section Isolation** 
- Each section has its own schema file and types
- Vendor and customer features can be built in parallel
- Clear ownership boundaries between sections
- Same database, different logical sections

### ✅ **AI-Friendly**
- Crystal clear file locations for each section
- Predictable patterns across all sections  
- No confusion about where code belongs
- Simple unified migration system

### ✅ **Future-Proof**
- Easy to split into microservices later (same schema structure)
- Single database simplifies operations and backups
- Perfect foundation for team scaling
- Unified migration history for all sections