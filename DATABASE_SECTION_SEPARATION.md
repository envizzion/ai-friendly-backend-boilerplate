# Database Section Separation Strategy

## 🎯 Approach: Separate Schema + Generated Files Per Section

This approach maintains complete isolation between database sections while preserving existing core functionality.

## 📁 Proposed Structure

```
src/shared/database/
├── core/
│   ├── drizzle-schema.ts       # ✅ EXISTING - keep as-is
│   ├── generated.ts            # ✅ EXISTING - keep as-is  
│   └── migrations/             # ✅ EXISTING core migrations
├── vendor/
│   ├── drizzle-schema.ts       # 🆕 NEW - vendor-specific tables
│   ├── generated.ts            # 🆕 NEW - vendor Kysely types
│   └── migrations/             # 🆕 NEW vendor migrations
├── customer/
│   ├── drizzle-schema.ts       # 🆕 NEW - customer-specific tables
│   ├── generated.ts            # 🆕 NEW - customer Kysely types
│   └── migrations/             # 🆕 NEW customer migrations
└── connections/
    ├── core.ts                 # Core DB connection
    ├── vendor.ts               # Vendor DB connection
    └── customer.ts             # Customer DB connection
```

## 🚀 Benefits of This Approach

### 1. **Zero Risk to Existing Core**
- Current core schema and types remain completely unchanged
- No refactoring of existing manufacturer/model/parts logic needed
- Existing APIs continue working exactly as before

### 2. **Complete Section Isolation**
```typescript
// Each section has its own database interface
interface CoreDB {
  manufacturer: Manufacturer;
  model: Model;
  part: Part;
  // ... existing core tables
}

interface VendorDB {
  vendorProfile: VendorProfile;
  inventory: Inventory;
  vendorOrders: VendorOrders;
  // ... vendor-specific tables
}

interface CustomerDB {
  customerProfile: CustomerProfile;
  cart: Cart;
  customerOrders: CustomerOrders;
  // ... customer-specific tables
}
```

### 3. **Independent Development**
- Vendor features can be developed without touching core schema
- Customer features completely separate from vendor
- Each section has its own migration history
- Teams can work independently on different sections

### 4. **AI-Friendly Clarity**
```typescript
// AI prompts become crystal clear:
"Add inventory table to vendor schema"           → src/shared/database/vendor/
"Create shopping cart for customer schema"       → src/shared/database/customer/
"Update manufacturer in core schema"             → src/shared/database/core/
```

## 🔧 Implementation Details

### 1. Database Connections

#### Core Connection (Existing)
```typescript
// src/shared/database/connections/core.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../core/drizzle-schema';

const coreClient = postgres(process.env.CORE_DATABASE_URL!);
export const coreDb = drizzle(coreClient, { schema });

export type CoreDB = typeof coreDb;
```

#### Vendor Connection (New)
```typescript
// src/shared/database/connections/vendor.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../vendor/drizzle-schema';

const vendorClient = postgres(process.env.VENDOR_DATABASE_URL!);
export const vendorDb = drizzle(vendorClient, { schema });

export type VendorDB = typeof vendorDb;
```

#### Customer Connection (New)
```typescript
// src/shared/database/connections/customer.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../customer/drizzle-schema';

const customerClient = postgres(process.env.CUSTOMER_DATABASE_URL!);
export const customerDb = drizzle(customerClient, { schema });

export type CustomerDB = typeof customerDb;
```

### 2. Section-Specific Schemas

#### Vendor Schema Example
```typescript
// src/shared/database/vendor/drizzle-schema.ts
import { pgTable, serial, uuid, varchar, timestamp, integer, boolean, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Vendor profile table
export const vendorProfiles = pgTable('vendor_profile', {
  id: serial('id').primaryKey(),
  publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
  businessName: varchar('business_name', { length: 200 }).notNull(),
  businessType: varchar('business_type', { length: 50 }).notNull(),
  taxId: varchar('tax_id', { length: 50 }),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }),
  isVerified: boolean('is_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vendor inventory table
export const vendorInventory = pgTable('vendor_inventory', {
  id: serial('id').primaryKey(),
  publicId: uuid('public_id').notNull().unique().default(sql`gen_random_uuid()`),
  vendorId: integer('vendor_id').references(() => vendorProfiles.id).notNull(),
  
  // Reference to core parts via public ID
  corePartPublicId: uuid('core_part_public_id').notNull(), // Links to core.parts.publicId
  
  quantity: integer('quantity').default(0).notNull(),
  price: varchar('price', { length: 20 }).notNull(),
  cost: varchar('cost', { length: 20 }),
  condition: varchar('condition', { length: 50 }).notNull().default('new'),
  location: varchar('location', { length: 100 }),
  sku: varchar('sku', { length: 100 }),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Customer Schema Example
```typescript
// src/shared/database/customer/drizzle-schema.ts
import { pgTable, serial, uuid, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
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
  
  // Reference to vendor inventory via public ID
  vendorInventoryPublicId: uuid('vendor_inventory_public_id').notNull(),
  
  quantity: integer('quantity').notNull(),
  priceAtAdd: varchar('price_at_add', { length: 20 }).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});
```

### 3. Repository Pattern Updates

#### Core Repository (Unchanged)
```typescript
// src/features/core/manufacturer/manufacturer.repository.ts
import { Kysely } from 'kysely';
import type { DB } from '../../../shared/database/core/generated'; // Uses existing core types

export class ManufacturerRepository {
  constructor(private db: Kysely<DB>) {}
  
  // All existing methods stay the same
  async findByPublicId(publicId: string) {
    return await this.db
      .selectFrom('manufacturer')
      .selectAll()
      .where('publicId', '=', publicId)
      .executeTakeFirst();
  }
}
```

#### Vendor Repository (New)
```typescript
// src/features/vendor/inventory/inventory.repository.ts
import { Kysely } from 'kysely';
import type { DB } from '../../../shared/database/vendor/generated'; // Uses vendor types

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

#### Customer Repository (New)
```typescript
// src/features/customer/cart/cart.repository.ts
import { Kysely } from 'kysely';
import type { DB } from '../../../shared/database/customer/generated'; // Uses customer types

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

### 4. Cross-Section Data Access

#### Service Layer with Multi-DB Access
```typescript
// src/features/vendor/inventory/inventory.service.ts
export class VendorInventoryService {
  constructor(
    private vendorInventoryRepo: VendorInventoryRepository,  // Vendor DB
    private corePartRepo: PartRepository,                    // Core DB  
    private coreManufacturerRepo: ManufacturerRepository     // Core DB
  ) {}
  
  async getInventoryWithPartDetails(vendorId: number) {
    // Get vendor inventory from vendor DB
    const inventory = await this.vendorInventoryRepo.findByVendorId(vendorId);
    
    // Enrich with part details from core DB
    const enrichedInventory = await Promise.all(
      inventory.map(async (item) => {
        const partDetails = await this.corePartRepo.findByPublicId(item.corePartPublicId);
        return { ...item, partDetails };
      })
    );
    
    return enrichedInventory;
  }
}
```

## 🎯 Migration Strategy

### Phase 1: Set Up New Vendor Schema (Week 1)
```bash
# 1. Create vendor schema structure
mkdir -p src/shared/database/vendor/migrations

# 2. Create vendor schema file
touch src/shared/database/vendor/drizzle-schema.ts

# 3. Set up vendor database connection
# Use same PostgreSQL instance with vendor_ table prefix
# Or separate database entirely

# 4. Generate vendor types
npx kysely-codegen --out-file src/shared/database/vendor/generated.ts

# 5. Create first vendor migration
npx drizzle-kit generate --config=drizzle.vendor.config.ts
```

### Phase 2: Set Up New Customer Schema (Week 2)
```bash
# Same process for customer section
mkdir -p src/shared/database/customer/migrations
touch src/shared/database/customer/drizzle-schema.ts
# Generate types and migrations
```

### Phase 3: Implement Vendor Features (Week 3-4)
- Create vendor repositories using vendor types
- Implement vendor services with cross-section access
- Build vendor API endpoints

### Phase 4: Implement Customer Features (Week 5-6)
- Create customer repositories using customer types
- Implement customer services with cross-section access
- Build customer API endpoints

## 🔧 Configuration Files

### Separate Drizzle Configs
```typescript
// drizzle.core.config.ts (existing)
export default {
  schema: './src/shared/database/core/drizzle-schema.ts',
  out: './src/shared/database/core/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.CORE_DATABASE_URL!,
  },
};

// drizzle.vendor.config.ts (new)
export default {
  schema: './src/shared/database/vendor/drizzle-schema.ts',
  out: './src/shared/database/vendor/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.VENDOR_DATABASE_URL!,
  },
};

// drizzle.customer.config.ts (new)
export default {
  schema: './src/shared/database/customer/drizzle-schema.ts',
  out: './src/shared/database/customer/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.CUSTOMER_DATABASE_URL!,
  },
};
```

## 🎉 Why This Approach is Perfect

### ✅ **Risk-Free**
- Zero changes to existing core functionality
- No breaking changes to current APIs
- Existing code continues working unchanged

### ✅ **Clean Separation**
- Each section completely independent
- No schema conflicts between sections
- Clear ownership boundaries

### ✅ **Scalable**
- Each section can evolve independently
- Different teams can own different sections
- Easy to add new sections (admin, reporting, etc.)

### ✅ **AI-Friendly**
- Crystal clear where each type of table belongs
- No confusion about which schema to modify
- Predictable file locations

### ✅ **Future-Proof**
- Easy to split into microservices later
- Can use different databases per section if needed
- Perfect for team scaling

This approach gives you all the benefits of separation while maintaining the proven patterns you already have! 🚀