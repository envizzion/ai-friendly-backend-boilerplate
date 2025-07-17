# Parts Backend - Feature-Based Architecture

## 🎯 AI-Friendly Feature-Based Structure

This is the new feature-based structure of the parts backend, designed to be extremely AI-friendly for development.

## 📁 Project Structure

```
src/
├── features/                    # 🎯 Feature-based organization
│   ├── core/                    # 🏗️ CORE CATALOG FEATURES
│   │   ├── manufacturer/        # ✅ Manufacturer management (TEMPLATE)
│   │   │   ├── manufacturer.controller.ts
│   │   │   ├── manufacturer.service.ts
│   │   │   ├── manufacturer.repository.ts
│   │   │   ├── manufacturer.dto.ts
│   │   │   ├── manufacturer.routes.ts
│   │   │   └── manufacturer.schemas.ts
│   │   ├── model/               # 🚧 Vehicle models
│   │   ├── part/                # 🚧 Parts catalog
│   │   ├── part-alternative/    # 🚧 Alternative parts
│   │   ├── color/               # 🚧 Color management
│   │   └── body-style/          # 🚧 Body styles
│   ├── common/                  # 🔧 SHARED SERVICES
│   │   ├── auth/                # 🚧 Authentication
│   │   ├── file-upload/         # 🚧 File management
│   │   ├── ai-analysis/         # 🚧 AI services
│   │   └── image-analysis/      # 🚧 Image processing
│   ├── vendor/                  # 🏪 VENDOR FEATURES
│   │   ├── inventory/           # Vendor inventory management
│   │   ├── listings/            # Marketplace listings
│   │   ├── orders/              # Order fulfillment
│   │   ├── analytics/           # Sales analytics
│   │   └── profile/             # Vendor profile
│   └── customer/                # 🛒 CUSTOMER FEATURES
│       ├── search/              # Product search
│       ├── cart/                # Shopping cart
│       ├── orders/              # Order management
│       ├── profile/             # Customer profile
│       └── wishlist/            # Wishlist management
├── shared/                      # 🔧 Shared infrastructure
│   ├── database/                # Database with section-based schemas
│   │   ├── schemas/             # Schema files organized by section
│   │   │   ├── core/            # ✅ Core schema (manufacturers, models, parts)
│   │   │   │   ├── drizzle-schema.ts    # Existing core tables
│   │   │   │   └── kysely-types.ts      # Core Kysely types (renamed)
│   │   │   ├── vendor/          # 🆕 Vendor schema (inventory, profiles)
│   │   │   │   ├── drizzle-schema.ts    # Vendor-specific tables
│   │   │   │   └── kysely-types.ts      # Vendor Kysely types
│   │   │   └── customer/        # 🆕 Customer schema (cart, orders)
│   │   │       ├── drizzle-schema.ts    # Customer-specific tables
│   │   │       └── kysely-types.ts      # Customer Kysely types
│   │   ├── migrations/          # 📁 Single unified migrations directory
│   │   └── connections/         # Database connections per section
│   ├── cloud/                   # Cloud providers (GCP, AWS)
│   ├── auth/                    # JWT & authentication
│   ├── types/                   # Common types
│   ├── utils/                   # Shared utilities
│   ├── messaging/               # Queue & email services
│   └── monitoring/              # Logging & metrics
├── config/                      # Configuration
│   ├── env.ts
│   └── constants.ts
├── routes.ts                    # Central route registration
├── server.ts                    # Server setup
└── index.ts                     # Entry point
```

## ✅ Server Infrastructure

### **Production-Ready Server Setup**
- ✅ **OpenAPIHono Framework** - Modern OpenAPI-first web framework
- ✅ **Comprehensive Middleware Stack** - CORS, compression, logging, error handling
- ✅ **Structured Error Handling** - Centralized error logging with context
- ✅ **OpenAPI Documentation** - Auto-generated docs at `/doc` and `/openapi.json`
- ✅ **Static File Serving** - Static assets served from `/static/*`
- ✅ **Development Utilities** - Test endpoints and route debugging

### **Background Processing System**
- ✅ **BullMQ Integration** - Redis-based job queue for async tasks
- ✅ **Task Registry** - Pluggable task processor system
- ✅ **Worker Management** - Automatic worker startup and graceful shutdown
- ✅ **Sample Tasks** - Welcome email task as template for new tasks
- ✅ **Error Handling** - Comprehensive job failure logging and retry logic

### **Health Monitoring & Observability**
- ✅ **Health Check Endpoints**:
  - `/api/health` - Detailed system health with service status
  - `/api/health/live` - Kubernetes liveness probe
  - `/api/health/ready` - Kubernetes readiness probe
- ✅ **Service Health Monitoring** - Database, Redis, and memory monitoring
- ✅ **Response Time Tracking** - Performance monitoring for all services
- ✅ **Memory Usage Alerts** - Automatic detection of memory pressure

### **Production Operations**
- ✅ **Graceful Shutdown** - Proper cleanup of connections and workers
- ✅ **Database Connection Management** - Connection testing and error handling
- ✅ **Redis Integration** - Queue processing and caching support
- ✅ **Environment Configuration** - Comprehensive environment variable validation
- ✅ **Development Mode Features** - Auto-spec export and enhanced debugging

## 🚪 API Organization

### **Core Section** (`/api/core/`)
**Purpose**: Catalog management and foundational data used by all user types
- `/api/core/manufacturers/` ✅ - Manufacturer management
- `/api/core/models/` 🚧 - Vehicle models  
- `/api/core/parts/` 🚧 - Parts catalog
- `/api/core/part-alternatives/` 🚧 - Alternative parts
- `/api/core/colors/` 🚧 - Color management
- `/api/core/body-styles/` 🚧 - Body styles

### **Common Section** (`/api/common/`)
**Purpose**: Shared services used across different user types
- `/api/common/auth/` 🚧 - Authentication & authorization
- `/api/common/files/` 🚧 - File uploads & media
- `/api/common/ai-analysis/` 🚧 - AI processing services
- `/api/common/image-analysis/` 🚧 - Image processing

### **Vendor Section** (`/api/vendor/`)
**Purpose**: Marketplace seller/supplier functionality
- `/api/vendor/inventory/` 🚧 - Inventory management
- `/api/vendor/listings/` 🚧 - Product listings
- `/api/vendor/orders/` 🚧 - Order fulfillment
- `/api/vendor/analytics/` 🚧 - Sales metrics
- `/api/vendor/profile/` 🚧 - Vendor profile

### **Customer Section** (`/api/customer/`)
**Purpose**: Buyer/consumer functionality
- `/api/customer/search/` 🚧 - Product search
- `/api/customer/cart/` 🚧 - Shopping cart
- `/api/customer/orders/` 🚧 - Order management
- `/api/customer/profile/` 🚧 - Customer profile
- `/api/customer/wishlist/` 🚧 - Wishlist

### Manufacturer Feature (Template)
The manufacturer feature is fully implemented and serves as the template for all other features:

- **API Endpoint**: `/api/core/manufacturers/`
- **Full CRUD operations**: Create, Read, Update, Delete
- **Advanced filtering**: Search, pagination, sorting
- **OpenAPI documentation**: Fully documented with Zod schemas
- **Type safety**: End-to-end TypeScript types

## 🚧 Migration Status

### **Core Features** (5/6 remaining)
- ✅ Manufacturer (template complete)
- 🚧 Model
- 🚧 Part  
- 🚧 Part Alternative
- 🚧 Color
- 🚧 Body Style

### **Common Features** (0/4 started)
- 🚧 Authentication
- 🚧 File Upload
- 🚧 AI Analysis
- 🚧 Image Analysis

### **Vendor Features** (0/5 started)
- 🚧 Inventory Management
- 🚧 Marketplace Listings
- 🚧 Order Fulfillment
- 🚧 Sales Analytics
- 🚧 Vendor Profile

### **Customer Features** (0/5 started)
- 🚧 Product Search
- 🚧 Shopping Cart
- 🚧 Order Management
- 🚧 Customer Profile
- 🚧 Wishlist Management

**Overall Progress**: 1/20 features (5%)

## 🔧 Available Endpoints

### **System & Health**
- ✅ `GET /` - API information and status
- ✅ `GET /api/health` - Comprehensive health check
- ✅ `GET /api/health/live` - Liveness probe (Kubernetes)
- ✅ `GET /api/health/ready` - Readiness probe (Kubernetes)
- ✅ `GET /doc` - Swagger UI documentation
- ✅ `GET /openapi.json` - OpenAPI specification
- ✅ `GET /test-error` - Test error handling (development only)

### **Core Features**
- ✅ `GET /api/core/manufacturers` - List manufacturers with filtering
- ✅ `POST /api/core/manufacturers` - Create new manufacturer
- ✅ `GET /api/core/manufacturers/{id}` - Get manufacturer by public ID
- ✅ `PUT /api/core/manufacturers/{id}` - Update manufacturer
- ✅ `DELETE /api/core/manufacturers/{id}` - Delete manufacturer

### **Infrastructure Features**
- ✅ **Background Job Processing** - Redis-based task queue
- ✅ **Database Error Logging** - Centralized query logging with `executeQuery`
- ✅ **Static File Serving** - Assets served from `/static/*`
- ✅ **CORS & Security** - Production-ready middleware stack
- ✅ **Auto-Generated Docs** - OpenAPI spec exported to `/openapi/`
- ✅ **Cloud Provider System** - AWS & GCP integration for storage, AI, and image analysis

## 🔥 AI Development Benefits

### Crystal Clear AI Prompts
```typescript
// Instead of: "Update the manufacturer service in the service folder"
// AI prompt: "Update the manufacturer feature in core to add search functionality"
// AI immediately knows to look in src/features/core/manufacturer/

// Or: "Create authentication in common features"
// AI knows to create in src/features/common/auth/

// Or: "Add inventory management to vendor features"
// AI knows to create in src/features/vendor/inventory/
```

### Consistent Patterns
Every feature follows the exact same structure:
- `{feature}.controller.ts` - HTTP handling
- `{feature}.service.ts` - Business logic
- `{feature}.repository.ts` - Data access
- `{feature}.dto.ts` - Types & DTOs
- `{feature}.routes.ts` - Route definitions
- `{feature}.schemas.ts` - Validation schemas

### Easy Feature Addition
```typescript
// AI prompt: "Create a new 'category' feature in core following the manufacturer pattern"
// AI will create: src/features/core/category/ with all 6 files

// AI prompt: "Create vendor analytics feature following standard pattern"
// AI will create: src/features/vendor/analytics/ with all 6 files

// AI prompt: "Create customer wishlist feature"
// AI will create: src/features/customer/wishlist/ with all 6 files
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Configure your database and other services
   ```

3. **Run migrations**:
   ```bash
   pnpm db:migrate
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

5. **Test the APIs**:
   ```bash
   # Test health endpoint
   curl http://localhost:3000/api/health
   
   # Test manufacturer API
   curl http://localhost:3000/api/core/manufacturers
   
   # View API documentation
   open http://localhost:3000/doc
   ```

6. **Test background processing**:
   ```bash
   # Add a sample task (you can create an endpoint for this)
   curl -X POST http://localhost:3000/api/tasks/welcome-email \
     -H "Content-Type: application/json" \
     -d '{"userId": "123", "email": "test@example.com", "name": "Test User"}'
   ```

## 🗄️ Database Architecture

### Section-Based Database Isolation
Our database is organized into completely separate sections for optimal development:

#### Core Section (Existing)
- **Purpose**: Catalog data used by all user types
- **Tables**: manufacturers, models, parts, users, files
- **Schema**: `src/shared/database/schemas/core/drizzle-schema.ts` ✅
- **Types**: `src/shared/database/schemas/core/kysely-types.ts` ✅

#### Vendor Section (New)
- **Purpose**: Seller/supplier business operations
- **Tables**: vendorProfiles, vendorInventory, vendorOrders
- **Schema**: `src/shared/database/schemas/vendor/drizzle-schema.ts` 🚧
- **Types**: `src/shared/database/schemas/vendor/kysely-types.ts` 🚧

#### Customer Section (New)
- **Purpose**: Buyer/consumer functionality
- **Tables**: customerProfiles, shoppingCarts, customerOrders
- **Schema**: `src/shared/database/schemas/customer/drizzle-schema.ts` 🚧
- **Types**: `src/shared/database/schemas/customer/kysely-types.ts` 🚧

### Cross-Section References
Sections communicate via **public IDs** for loose coupling:
```typescript
// Vendor inventory references core parts
vendorInventory.corePartPublicId → core.parts.publicId

// Customer cart references vendor inventory
shoppingCart.vendorInventoryPublicId → vendor.vendorInventory.publicId
```

### Benefits of This Approach
- **Zero Risk**: Core functionality remains unchanged
- **Complete Isolation**: Each section evolves independently
- **AI-Friendly**: Crystal clear where each feature belongs
- **Team Ready**: Perfect for parallel development

## 📚 Documentation

### **API Documentation**
- **Swagger UI**: `http://localhost:3000/doc`
- **OpenAPI JSON**: `http://localhost:3000/openapi.json`

### **Cloud Providers**
- **Cloud Providers Guide**: [`CLOUD_PROVIDERS.md`](./CLOUD_PROVIDERS.md) - Comprehensive guide to AWS & GCP integration
- **Storage Management**: File uploads, CDN URLs, and bucket operations
- **AI Analysis**: Parts catalog analysis with Google Gemini AI
- **Image Processing**: Text extraction with AWS Textract and Google Vision
- **Provider Factory**: Easy initialization and management of cloud services

## 🔧 Development Guide

### Adding a New Feature

1. **Create feature folder**:
   ```bash
   mkdir src/features/new-feature
   ```

2. **Copy manufacturer pattern**:
   ```bash
   # Use manufacturer as template
   cp -r src/features/manufacturer/* src/features/new-feature/
   # Rename files and update code
   ```

3. **Register routes**:
   ```typescript
   // In src/routes.ts
   import { createNewFeatureRouter } from './features/new-feature/new-feature.routes';
   api.route('/new-features', createNewFeatureRouter());
   ```

### Modifying Existing Feature

All related code is in one place:
```
src/features/manufacturer/
├── manufacturer.controller.ts  # Add new endpoints here
├── manufacturer.service.ts     # Add business logic here
├── manufacturer.repository.ts  # Add database queries here
├── manufacturer.routes.ts      # Register new routes here
└── manufacturer.schemas.ts     # Add validation schemas here
```

## 📈 Migration Plan

### Database Section Development

#### Phase 1: Core Features (1/6 complete)
- ✅ Manufacturer (template complete) 
- 🚧 Model, Part, Part Alternative, Color, Body Style

#### Phase 2: Vendor Database Section (0/4 started)
1. **Set up vendor schema**: `src/shared/database/schemas/vendor/drizzle-schema.ts`
2. **Generate vendor types**: `src/shared/database/schemas/vendor/kysely-types.ts`
3. **Create unified migration**: Add vendor tables to single migrations directory
4. **Create vendor features**: inventory, profile, orders, analytics
5. **Build vendor APIs**: `/api/vendor/*` endpoints

#### Phase 3: Customer Database Section (0/4 started)
1. **Set up customer schema**: `src/shared/database/schemas/customer/drizzle-schema.ts`
2. **Generate customer types**: `src/shared/database/schemas/customer/kysely-types.ts`
3. **Create unified migration**: Add customer tables to single migrations directory
4. **Create customer features**: cart, orders, profile, search, wishlist
5. **Build customer APIs**: `/api/customer/*` endpoints

#### Phase 4: Common Services (0/4 started)
- 🚧 Authentication, File Upload, AI Analysis, Image Analysis

### Migration Benefits
- ✅ **Zero Breaking Changes**: All existing APIs work unchanged
- ✅ **Independent Development**: Sections can be built in parallel
- ✅ **Complete Isolation**: No conflicts between vendor/customer features
- ✅ **AI-Friendly**: Clear boundaries for feature development

## 🎉 Benefits Achieved

### For Current Development
- **🎯 AI-Friendly**: Crystal clear feature placement and boundaries
- **🔄 Zero Breaking Changes**: All existing APIs work exactly the same
- **📦 Complete Isolation**: Each database section is independent
- **🔧 Consistent Patterns**: Same 6-file structure in every feature
- **🚀 Risk-Free Evolution**: Core functionality remains untouched

### For Future Scaling
- **👥 Team Ready**: Clear ownership boundaries between sections
- **🔀 Parallel Development**: Vendor and customer teams can work independently
- **🏗️ Microservice Prepared**: Easy to split sections into separate services later
- **🗄️ Single Database**: Simplified operations, backups, and consistency
- **📈 Infinitely Scalable**: Add new sections (admin, reporting, etc.) easily
- **🔧 Unified Migrations**: Single migration history for all sections

## 🎯 Database Development Workflow

### Adding New Tables
```bash
# For vendor features
nano src/shared/database/schemas/vendor/drizzle-schema.ts
npm run db:generate-vendor-types  # Generate types for vendor tables only
npx drizzle-kit generate          # Creates unified migration

# For customer features  
nano src/shared/database/schemas/customer/drizzle-schema.ts
npm run db:generate-customer-types # Generate types for customer tables only
npx drizzle-kit generate           # Creates unified migration

# Regenerate all types after schema changes
npm run db:generate-all-types      # Regenerates core, vendor, and customer types
```

### Package.json Scripts
```json
{
  "scripts": {
    "db:generate-core-types": "kysely-codegen --out-file src/shared/database/schemas/core/kysely-types.ts --include-pattern 'manufacturer|model|part|user|file|color|body_style'",
    "db:generate-vendor-types": "kysely-codegen --out-file src/shared/database/schemas/vendor/kysely-types.ts --include-pattern 'vendor_*'",
    "db:generate-customer-types": "kysely-codegen --out-file src/shared/database/schemas/customer/kysely-types.ts --include-pattern 'customer_*|shopping_*'",
    "db:generate-all-types": "npm run db:generate-core-types && npm run db:generate-vendor-types && npm run db:generate-customer-types"
  }
}
```

### Cross-Section Data Access
```typescript
// Services can access multiple database sections (same DB, different schemas)
export class VendorService {
  constructor(
    private vendorRepo: VendorRepository,    // Uses vendor kysely-types
    private corePartRepo: PartRepository     // Uses core kysely-types
  ) {}
  
  async enrichInventoryWithPartData(vendorId: number) {
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

This structure makes the codebase incredibly easy for AI to understand and modify, with complete section isolation and zero risk to existing functionality! 🚀