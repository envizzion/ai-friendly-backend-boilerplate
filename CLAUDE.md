# Claude AI Development Guide

This file provides Claude AI with quick access to all project documentation and implementation guides for the Parts Backend New project.

## 📁 Documentation Structure

All documentation is located in the `/docs/` folder:

```
docs/
├── README.md                           # Project overview and architecture
├── TESTING_STRATEGY.md                 # Complete testing setup and strategy  
├── TESTING_SETUP.md                    # Testing prerequisites and environment
├── TYPE_SYSTEM_DOCUMENTATION.md        # Zod schemas and TypeScript types
├── VSCODE_SETUP.md                     # VS Code configuration and troubleshooting
├── CLOUD_PROVIDERS.md                  # AWS & GCP integration setup
├── DATABASE_IMPLEMENTATION_COMPLETE.md # Database architecture and setup
├── DATABASE_SECTION_SEPARATION.md      # Domain-based database organization
├── DATABASE_STRUCTURE_REORGANIZATION.md # Database migration strategy
├── CROSS_DOMAIN_DATABASE_ACCESS.md     # Pragmatic cross-domain query strategy
├── MODULE_SYSTEM_COMPARISON.md         # ES Modules vs Bundled comparison
└── versioning_analysis.md              # API evolution strategy
```

## 🎯 Quick Reference by Task

### **Understanding the Project**
- **Start here**: `docs/README.md`
- **Architecture**: Domain-based features (core, vendor, customer, common)
- **Current status**: Manufacturer feature is the complete template

### **Implementing a New Feature**
Use this step-by-step guide (not in existing docs):

#### 1. **Analyze the Domain**
```bash
# Determine which domain: core, vendor, customer, or common
# Example: "inventory management" → vendor domain
```

#### 2. **Create Feature Structure**
```bash
mkdir -p src/features/{domain}/{feature-name}
# Create these files:
touch src/features/{domain}/{feature-name}/{feature}.controller.ts
touch src/features/{domain}/{feature-name}/{feature}.service.ts  
touch src/features/{domain}/{feature-name}/{feature}.repository.ts
touch src/features/{domain}/{feature-name}/{feature}.routes.ts
```

#### 3. **Create Schema**
```bash
# Create schema file
touch src/schemas/{domain}/{feature}.schemas.ts
```

Follow the pattern in `docs/TYPE_SYSTEM_DOCUMENTATION.md`:
- Define Zod schemas with OpenAPI annotations
- Export TypeScript types using `z.infer<>`
- Include CRUD operation schemas (create, update, response, list query)

#### 4. **Implement Repository** 
Copy from `src/features/core/manufacturer/manufacturer.repository.ts`:
- **Use unified database type** - `Kysely<DB>` provides full access with type safety
- **Read freely across domains** - Use JOINs for performance, avoid N+1 queries  
- **Write only to own domain** - Only modify tables your repository owns
- Implement CRUD operations with optimal query patterns
- Add filtering, sorting, pagination
- Handle error cases

#### 5. **Implement Service**
Copy from `src/features/core/manufacturer/manufacturer.service.ts`:
- Business logic and validation
- Call repository methods
- Transform data between DTOs and entities
- Handle edge cases and errors

#### 6. **Implement Controller**
Copy from `src/features/core/manufacturer/manufacturer.controller.ts`:
- Parse query parameters using schemas
- Call service methods
- Return properly formatted responses
- Handle HTTP status codes

#### 7. **Create Routes**
Copy from `src/features/core/manufacturer/manufacturer.routes.ts`:
- Define OpenAPI route specifications
- Wire controller methods to HTTP endpoints
- Add request/response validation

#### 8. **Register Routes**
```typescript
// In src/routes/{domain}.routes.ts
import { create{Feature}Router } from '../features/{domain}/{feature}/{feature}.routes.js';

// Add to the router
app.route('/{features}', create{Feature}Router());
```

#### 9. **Write Tests**
Follow `docs/TESTING_STRATEGY.md`:
```bash
# Create test files
mkdir -p tests/unit/features/{domain}/{feature}
mkdir -p tests/integration/api/{domain}

# Copy test patterns from manufacturer tests
# Unit tests: service.test.ts, controller.test.ts  
# Integration tests: {feature}.test.ts
```

#### 10. **Update Database Schema** (if needed)
```bash
# Add tables to appropriate schema file
# src/shared/database/schemas/{domain}/drizzle-schema.ts

# Generate migration
pnpm db:generate

# Run migration  
pnpm db:migrate

# Regenerate types
pnpm db:generate-{domain}-types
```

### **Working with Tests**
- **Setup**: `docs/TESTING_SETUP.md`
- **Strategy**: `docs/TESTING_STRATEGY.md`
- **VS Code issues**: `docs/VSCODE_SETUP.md`

### **Type System & Schemas**
- **Reference**: `docs/TYPE_SYSTEM_DOCUMENTATION.md`
- **Pattern**: Zod schemas → TypeScript types
- **Location**: `src/schemas/{domain}/{feature}.schemas.ts`

### **Database Operations**
- **Architecture**: `docs/DATABASE_IMPLEMENTATION_COMPLETE.md`
- **Separation**: `docs/DATABASE_SECTION_SEPARATION.md`
- **Cross-Domain Queries**: `docs/CROSS_DOMAIN_DATABASE_ACCESS.md`
- **Schema files**: `src/shared/database/schemas/{domain}/`

### **VS Code Configuration**
- **Path aliases not working**: `docs/VSCODE_SETUP.md`
- **Quick fix**: Restart TypeScript Server (Cmd+Shift+P → "TypeScript: Restart TS Server")

### **Cloud Integration**
- **Setup**: `docs/CLOUD_PROVIDERS.md`
- **AWS & GCP**: File storage, AI analysis, image processing

### **API Evolution Strategy**
- **Analysis**: `docs/versioning_analysis.md`
- **Breaking Changes**: `BREAKING_CHANGES.md`
- **Current Phase**: Pre-Production - Move fast and break things freely

## 🏗️ Cross-Domain Database Access - Pragmatic Approach

**CORE PHILOSOPHY**: Leverage Kysely's built-in type safety and embrace pragmatic query patterns for optimal performance.

### **Simplified Principles**

#### **Read Freely, Write Responsibly**
- **Any repository can read from any table** for performance optimization
- **Only write to tables within your own domain** 
- Use JOINs liberally to avoid N+1 query problems
- Kysely prevents accidents with compile-time type safety

#### **Performance First**
- Start with efficient JOIN queries, not multiple round-trips
- JOINs are typically **10-100x faster** than separate queries  
- Single database round-trip reduces latency and resource usage
- Database optimizers work best with complete queries

#### **Convention Over Configuration**
- Use team agreements and code review, not complex type restrictions
- Repository documentation clearly states domain ownership
- Service layer handles cross-domain business logic and orchestration

### **Repository Pattern**

```typescript
// ✅ SIMPLIFIED: Use unified database type
export class ManufacturerRepository {
    constructor(private db: Kysely<DB> = dbConn) {}
    
    // ✅ ALLOWED: Cross-domain reads with JOINs for performance
    async findAllWithStats() {
        return this.db
            .selectFrom('manufacturer')
            .leftJoin('model', 'manufacturer.id', 'model.manufacturerId')
            .leftJoin('file', 'manufacturer.logoImageId', 'file.id')
            .select([
                'manufacturer.id',
                'manufacturer.name',
                'file.publicId as logoPublicId',
                (eb) => eb.fn.count('model.id').as('modelCount')
            ])
            .groupBy(['manufacturer.id', 'file.publicId'])
            .execute();
    }
    
    // ✅ ALLOWED: Write to own domain tables
    async create(data: CreateManufacturerData) {
        return this.db.insertInto('manufacturer').values(data).execute();
    }
    
    // ❌ NOT ALLOWED: Writing to other domain tables  
    // async updateVendorInventory() {
    //     return this.db.updateTable('vendorInventory').set({...}); // DON'T DO THIS
    // }
}
```

### **When to Use Cross-Domain Queries**

#### **✅ Perfect Use Cases:**
- Dashboard and reporting features requiring aggregated data
- Search functionality spanning multiple domains  
- List views with related information (manufacturer + model count)
- Any read operation where N+1 queries would occur
- Performance-critical user-facing features

#### **❌ Keep Separate When:**
- **Write operations** - Always use owning domain's service
- **Complex business logic** - Service orchestration provides flexibility
- **Different caching strategies** - Domain-specific cache invalidation
- **Team boundaries** - Different teams own different domains

### **Service Orchestration Pattern**

For cross-domain writes and complex operations:

```typescript
export class OrderService {
    constructor(
        private customerOrderRepo: CustomerOrderRepository,
        private vendorInventoryService: VendorInventoryService
    ) {}
    
    async createOrder(customerId: number, items: OrderItem[]) {
        // 1. Validate inventory (cross-domain read via repository)
        const inventory = await this.customerOrderRepo.getInventoryForItems(items);
        
        // 2. Create customer order (own domain)
        const order = await this.customerOrderRepo.create({ customerId, items });
        
        // 3. Update inventory via service (cross-domain write)
        await this.vendorInventoryService.reserveItems(items);
        
        return order;
    }
}
```

### **Key Benefits**

- **10-100x performance gains** from eliminating N+1 queries
- **Simplified mental model** - think in data relationships, not artificial boundaries
- **Faster development** - less boilerplate, more direct queries
- **Type safety without complexity** - Kysely handles the safety
- **Easier debugging** - direct queries are easier to understand and optimize

See **`docs/CROSS_DOMAIN_DATABASE_ACCESS.md`** for complete implementation guidelines.

## 🔧 Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build project
pnpm lint                   # Run ESLint

# Testing  
pnpm test:unit             # Fast unit tests
pnpm test:integration      # Database integration tests
pnpm test:coverage         # Coverage report
pnpm test:watch            # Watch mode

# Database
pnpm db:generate           # Generate migration
pnpm db:migrate            # Run migrations
pnpm db:push               # Push schema changes
pnpm db:generate-core-types     # Generate core types
pnpm db:generate-vendor-types   # Generate vendor types
pnpm db:generate-customer-types # Generate customer types
pnpm db:generate-all-types      # Generate all types
```

## 🏗️ Architecture Patterns

### **Domain Organization**
- **core/**: Catalog data (manufacturers, models, parts)
- **vendor/**: Marketplace sellers (inventory, listings)  
- **customer/**: Buyers (cart, orders, profile)
- **common/**: Shared services (auth, files, AI)

### **File Naming Convention**
- Controllers: `{feature}.controller.ts`
- Services: `{feature}.service.ts`
- Repositories: `{feature}.repository.ts`
- Routes: `{feature}.routes.ts` 
- Schemas: `{feature}.schemas.ts`
- Tests: `{feature}.test.ts`, `{feature}.service.test.ts`

### **Import Alias Best Practices**
Always use the most specific path alias available to keep imports short and maintainable:

**❌ Avoid generic aliases when specific ones exist:**
```typescript
// Don't use:
import { manufacturers } from '@/shared/database/schemas/core/drizzle-schema';
import { ManufacturerService } from '@/features/core/manufacturer/manufacturer.service';
import { CreateManufacturerDto } from '@/schemas/core/manufacturer.schemas';
```

**✅ Use specific aliases:**
```typescript
// Do use:
import { manufacturers } from '@core-db-schemas/drizzle-schema';
import { ManufacturerService } from '@core/manufacturer/manufacturer.service';
import { CreateManufacturerDto } from '@schemas/core/manufacturer.schemas';
```

**Available Path Aliases (from most to least specific):**
- `@core-db-schemas/*` → `src/shared/database/schemas/core/*`
- `@vendor-db-schemas/*` → `src/shared/database/schemas/vendor/*`
- `@customer-db-schemas/*` → `src/shared/database/schemas/customer/*`
- `@core/*` → `src/features/core/*`
- `@vendor/*` → `src/features/vendor/*`
- `@customer/*` → `src/features/customer/*`
- `@common/*` → `src/features/common/*`
- `@schemas/*` → `src/schemas/*`
- `@routes/*` → `src/routes/*`
- `@database/*` → `src/shared/database/*`
- `@shared/*` → `src/shared/*`
- `@config/*` → `src/config/*`
- `@utils/*` → `src/shared/utils/*`
- `@types/*` → `src/shared/types/*`
- `@tests/*` → `tests/*`

**Never use `@/` prefix** - always use the specific alias that best matches your import path.

### **ES Module Import Requirements**
**IMPORTANT: This project uses Native ES Modules. All local imports MUST include `.js` extensions.**

Based on our module system evaluation (see `docs/MODULE_SYSTEM_COMPARISON.md`), we use Native ES Modules for:
- Superior debugging experience
- Instant code reflection during development
- Simpler operational complexity
- Future flexibility

**❌ Incorrect (will cause import errors):**
```typescript
import { ManufacturerService } from '@core/manufacturer/manufacturer.service';
import { manufacturers } from '@core-db-schemas/drizzle-schema';
vi.mock('@core/manufacturer/manufacturer.repository');
```

**✅ Correct (ALWAYS use .js extension):**
```typescript
import { ManufacturerService } from '@core/manufacturer/manufacturer.service.js';
import { manufacturers } from '@core-db-schemas/drizzle-schema.js';
vi.mock('@core/manufacturer/manufacturer.repository.js');
```

**Import Rules:**
1. **All local imports** must end with `.js`
2. **All relative imports** must end with `.js`
3. **All alias imports** (`@core/*`, `@schemas/*`, etc.) must end with `.js`
4. **Mock imports** in tests must end with `.js`
5. **Only node_modules imports** don't need extensions

**Why .js extensions?**
- Node.js ES modules require explicit file extensions
- TypeScript compiles `.ts` files to `.js`, so imports must reference the output extension
- This is the official Node.js standard for ES modules
- Prevents "Cannot find module" errors in VS Code and runtime
- Aligns with our VM deployment strategy and development priorities

**Remember:** If you forget the `.js` extension, the import will fail at runtime!

### **Environment Variable Management**
**CRITICAL: All environment variables MUST be accessed through centralized configuration files.**

#### For Application Code:
**ALWAYS use `@shared/env.js`** - Never access `process.env` directly in application code.

**❌ Incorrect (will cause type issues and validation problems):**
```typescript
// Don't access process.env directly
const port = process.env.PORT || '3000';
const dbHost = process.env.DB_HOST;
if (process.env.ENABLE_AI_ANALYSIS === 'true') { ... }
```

**✅ Correct (use centralized env configuration):**
```typescript
import env from '@shared/env.js';

const port = env.PORT; // Validated and typed
const dbHost = env.DB_HOST; // Validated and typed
```

#### For Test Code:
**ALWAYS use `@tests/test-env.js`** - Never access `process.env` directly in test files.

**❌ Incorrect:**
```typescript
// Don't do this in tests
const testDbHost = process.env.TEST_DB_HOST;
```

**✅ Correct:**
```typescript
import testEnv from '@tests/test-env.js';

const testDbHost = testEnv.TEST_DB_HOST; // Validated and typed
```

#### Why This Rule?
1. **Type Safety** - Environment variables are validated with Zod schemas
2. **Runtime Validation** - Invalid environment configs fail early with clear errors
3. **Documentation** - Schema serves as documentation for required variables
4. **Consistency** - Single source of truth for all environment configuration
5. **Debugging** - Clear error messages when variables are missing or invalid

#### Adding New Environment Variables:
1. **Add to schema first** in `src/shared/env.ts`:
   ```typescript
   const envSchema = z.object({
     // Existing vars...
     NEW_FEATURE_FLAG: z.string().default('false'),
   });
   ```

2. **Use in application code**:
   ```typescript
   import env from '@shared/env.js';
   
   if (env.NEW_FEATURE_FLAG === 'true') {
     // Feature implementation
   }
   ```

3. **Add to test schema** in `tests/test-env.ts` if needed for tests

## 🚀 API Evolution Strategy

**Current Phase**: 🚧 **Pre-Production - Ship Fast**

Based on our API evolution analysis (`docs/versioning_analysis.md`), this project follows a **"Ship Fast Now, Add Versioning When Needed"** strategy.

### **Pre-Production Approach (Current)**

#### ✅ What You SHOULD Do:

1. **Break Things Freely**
   ```typescript
   // Change APIs without fear
   // Restructure schemas based on learnings
   // Rename fields for better clarity
   // No backward compatibility needed
   ```

2. **Use Simple Feature Flags**
   ```typescript
   import { FEATURES, isFeatureEnabled } from '@shared/constants.js';
   
   if (FEATURES.ENHANCED_SEARCH) {
     return enhancedSearchResults();
   }
   return basicSearchResults();
   ```

3. **Document Breaking Changes**
   ```markdown
   // Add to BREAKING_CHANGES.md:
   ### 2024-07-21 - Renamed manufacturer fields
   - manufacturer.name → manufacturer.displayName
   ```

4. **Environment-Driven Features**
   ```bash
   # Enable experimental features via env vars
   ENABLE_AI_ANALYSIS=true pnpm dev
   ENABLE_VENDOR_FEATURES=true pnpm dev
   ```

#### ❌ What You Should NOT Do:

- ❌ **Don't add version endpoints** (`/v1/`, `/v2/`)
- ❌ **Don't maintain backward compatibility**
- ❌ **Don't build versioning infrastructure**
- ❌ **Don't worry about breaking changes**

### **Available Feature Flags**

Use these environment variables to control experimental features:

```bash
# Enhanced search capabilities
ENABLE_ENHANCED_SEARCH=true

# AI-powered part analysis
ENABLE_AI_ANALYSIS=true

# Advanced filtering in manufacturer API
ENABLE_ADVANCED_FILTERS=true

# Experimental vendor features
ENABLE_VENDOR_FEATURES=true

# Customer wishlist functionality
ENABLE_WISHLIST=true
```

### **Breaking Changes Policy**

#### Current Phase: Pre-Production
- ✅ **Breaking changes allowed** - Focus on API design quality
- ✅ **Change schemas freely** - Find the right data structure
- ✅ **Restructure endpoints** - Optimize for developer experience
- ✅ **Rename fields** - Use clear, consistent naming

#### Future Phase: Early Production (After first users)
- 🟡 **Switch to additive-only changes**
- 🟡 **Add fields as optional only**
- 🟡 **No field removal or renaming**
- 🟡 **Maintain backward compatibility**

#### Future Phase: Scale Production (Multiple clients)
- 🔴 **Add feature-level versioning** (only if needed)
- 🔴 **Coordinate breaking changes carefully**
- 🔴 **Use client version detection**

### **When to Add Versioning**

**Don't add versioning until you have:**
- Multiple client applications
- External API consumers
- Enterprise customers
- Mobile apps in app stores

**Then implement feature-level versioning:**
```typescript
/api/core/manufacturers/v1  // Original version
/api/core/manufacturers/v2  // New version
/api/core/parts/v1          // Parts stay at v1
```

### **Migration Strategy**

Your current architecture is **already version-ready**:

```typescript
// Feature-based structure supports any versioning approach
src/features/{domain}/{feature}/
├── {feature}.controller.ts    // Easy to create v2 controller
├── {feature}.service.ts       // Business logic can be shared
├── {feature}.repository.ts    // Data access stays same
├── {feature}.routes.ts        // Add v2 routes easily
└── {feature}.schemas.ts       // Version schemas separately
```

### **Response Transformation Pattern**

Prepare for future versioning with centralized response shaping:

```typescript
// Create response transformers early
const toManufacturerResponse = (data: any, version = 'v1') => {
  const base = {
    id: data.id,
    displayName: data.name,
    createdAt: data.createdAt,
  };
  
  if (version === 'v2') {
    return {
      ...base,
      metadata: data.metadata, // Future enhancement
    };
  }
  
  return base;
};
```

### **Database Strategy**
- Single database with domain-separated schemas
- Drizzle ORM for schema definition
- Kysely for type-safe queries
- Cross-domain references via public IDs

### **Testing Strategy**
- 70% unit tests (mocked dependencies)
- 25% integration tests (real database)
- 5% E2E tests (critical paths)
- Test databases created/destroyed per test suite

## 🚨 Important Notes

1. **ALWAYS use `.js` extensions in imports** - This project uses Native ES Modules (see ES Module Import Requirements above)
2. **NEVER access `process.env` directly** - Use `@shared/env.js` for app code, `@tests/test-env.js` for tests (see Environment Variable Management above)
3. **Read freely, write responsibly** - Use JOINs across domains for performance, but only write to your own domain tables (see Cross-Domain Database Access above)
4. **Break APIs freely in pre-production** - We're in "Ship Fast" phase, no backward compatibility needed (see API Evolution Strategy above)
5. **Always use the manufacturer feature as your template** - it's the complete reference implementation
6. **Follow the domain-based organization** - don't create features outside the domain structure
7. **Include tests for new features** - both unit and integration tests
8. **Use Zod schemas for all validation** - don't create manual type definitions
9. **Document breaking changes** - Add all API changes to `BREAKING_CHANGES.md`
10. **Test database setup requires existing PostgreSQL** - connection details in `.env.test`

## 📋 Checklist for New Features

- [ ] Created feature directory in appropriate domain
- [ ] Implemented all 4 core files (controller, service, repository, routes)
- [ ] Created Zod schemas with TypeScript types
- [ ] Added route registration to domain router
- [ ] Written unit tests (service, controller)
- [ ] Written integration tests (API endpoints)
- [ ] Updated database schema if needed
- [ ] Generated and ran migrations
- [ ] Tested in development environment

## 🔍 Common Issues & Solutions

**Import alias errors in VS Code**: See `docs/VSCODE_SETUP.md`
**Test database connection issues**: Check PostgreSQL container is running
**Type errors in tests**: Ensure all dependencies are installed and paths are correct
**Migration issues**: Verify database permissions and connection string

---

This guide ensures consistent implementation across all features while maintaining the high quality and testing standards established in the project.