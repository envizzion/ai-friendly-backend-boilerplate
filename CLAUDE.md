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
└── DATABASE_STRUCTURE_REORGANIZATION.md # Database migration strategy
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
- Use domain-specific database connection
- Implement CRUD operations
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
- **Schema files**: `src/shared/database/schemas/{domain}/`

### **VS Code Configuration**
- **Path aliases not working**: `docs/VSCODE_SETUP.md`
- **Quick fix**: Restart TypeScript Server (Cmd+Shift+P → "TypeScript: Restart TS Server")

### **Cloud Integration**
- **Setup**: `docs/CLOUD_PROVIDERS.md`
- **AWS & GCP**: File storage, AI analysis, image processing

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
2. **Always use the manufacturer feature as your template** - it's the complete reference implementation
3. **Follow the domain-based organization** - don't create features outside the domain structure
4. **Include tests for new features** - both unit and integration tests
5. **Use Zod schemas for all validation** - don't create manual type definitions
6. **Test database setup requires existing PostgreSQL** - connection details in `.env.test`

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