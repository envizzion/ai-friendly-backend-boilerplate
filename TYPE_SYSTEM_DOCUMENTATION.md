# Type System Documentation

## Overview

This document describes the type system implementation in the parts-backend-new project, focusing on how we handle schema validation and type safety using Zod and TypeScript.

## Type Alias Pattern

All schema files follow a consistent pattern for defining and exporting types:

1. **Schema Definition**: Using Zod with OpenAPI annotations
2. **Type Export**: Using `z.infer<>` to generate TypeScript types from schemas

### Example Structure

```typescript
// 1. Define the schema
export const createManufacturerSchema = z.object({
    name: z.string().min(1).max(255),
    displayName: z.string().min(1).max(255),
    // ... other fields
});

// 2. Export the type alias
export type CreateManufacturerDto = z.infer<typeof createManufacturerSchema>;
```

## Schema Organization

### Directory Structure
```
src/
├── features/             # Domain-organized features
│   ├── common/          # Common features across domains
│   ├── core/            # Core catalog domain features
│   ├── customer/        # Customer shopping domain features
│   └── vendor/          # Vendor marketplace domain features
└── schemas/             # Centralized schemas
    ├── core/            # Core business schemas
    │   └── manufacturer.schemas.ts
    ├── common/          # Shared schemas
    │   ├── pagination.schemas.ts
    │   └── response.schemas.ts
    ├── customer/        # Customer-specific schemas
    └── vendor/          # Vendor-specific schemas
```

### Available Type Aliases

#### Manufacturer Types (`manufacturer.schemas.ts`)
- `CreateManufacturerDto` - Data for creating a new manufacturer
- `UpdateManufacturerDto` - Data for updating an existing manufacturer
- `ManufacturerResponse` - Basic manufacturer response
- `ManufacturerDetailResponse` - Detailed manufacturer response
- `ManufacturerListQuery` - Query parameters for listing manufacturers
- `ManufacturerListResponse` - Paginated list response
- `ToggleManufacturerStatus` - Status toggle request

#### Common Types (`pagination.schemas.ts`)
- `PaginationQuery` - Common pagination parameters
- `PaginationResponse` - Pagination metadata

#### Response Types (`response.schemas.ts`)
- `ErrorResponse` - Standard error response
- `SuccessResponse` - Generic success response
- `HealthResponse` - Health check response

## Usage in Controllers

Controllers should import both the type aliases and schemas for proper type safety and validation:

```typescript
import { 
    CreateManufacturerDto, 
    UpdateManufacturerDto,
    ManufacturerListQuery,
    manufacturerListQuerySchema 
} from '../../../schemas/core/manufacturer.schemas.js';

// In the controller method
getAllManufacturers = async (c: Context) => {
    try {
        // Parse and validate query parameters
        const rawQuery = c.req.query();
        const parsedQuery = manufacturerListQuerySchema.parse(rawQuery);
        
        // parsedQuery is now typed as ManufacturerListQuery
        const manufacturers = await this.service.getAllManufacturers(parsedQuery);
        return c.json(manufacturers);
    } catch (error) {
        // Handle validation or other errors
        console.error('Error getting all manufacturers:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
};
```

## Benefits

1. **Type Safety**: Full TypeScript type checking throughout the application
2. **Runtime Validation**: Zod schemas validate data at runtime
3. **Single Source of Truth**: Types are generated from schemas, ensuring consistency
4. **OpenAPI Documentation**: Schema annotations automatically generate API documentation
5. **Better IDE Support**: Autocomplete and type hints for all DTOs and responses

## Best Practices

1. **Always parse input data** using the corresponding schema before passing to services
2. **Export type aliases** alongside schemas for better developer experience
3. **Use descriptive names** ending with appropriate suffixes (Dto, Response, Query)
4. **Include OpenAPI annotations** for better API documentation
5. **Keep schemas close to their domain** - avoid creating a separate types directory

## Adding New Schemas

When creating new features:

1. Create a schema file in the appropriate directory
2. Define Zod schemas with OpenAPI annotations
3. Export type aliases at the bottom of the file
4. Import and use in controllers/services as needed

Example for a new feature:
```typescript
// src/schemas/core/product.schemas.ts
import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(1).max(255),
    manufacturerId: z.string().uuid(),
    price: z.number().positive(),
    // ... other fields
}).openapi('CreateProductRequest');

// Export type aliases
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
// ... other types
```

## Migration Notes

The codebase has been updated to use this consistent pattern. All schema imports now include proper type aliases, and controllers have been updated to parse query parameters using the appropriate schemas for type safety.