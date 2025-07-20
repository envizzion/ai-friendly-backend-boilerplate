import { z } from '@hono/zod-openapi';

// ============================================
// MANUFACTURER DOMAIN SCHEMAS
// ============================================

export const createManufacturerSchema = z.object({
    name: z.string().min(1).max(100).openapi({
        example: 'Tesla',
        description: 'Manufacturer name'
    }),
    displayName: z.string().min(1).max(100).openapi({
        example: 'Tesla, Inc.',
        description: 'Display name for UI'
    }),
    logoImageId: z.string().optional().openapi({
        example: 'img_abc123',
        description: 'Public ID of the logo image file'
    }),
    countryCode: z.string().regex(/^[A-Z]{2}$/).optional().openapi({
        example: 'US',
        description: '2-letter ISO country code'
    }),
    description: z.string().optional().openapi({
        example: 'Electric vehicle manufacturer',
        description: 'Manufacturer description'
    }),
    isActive: z.boolean().optional().default(true).openapi({
        example: true,
        description: 'Whether the manufacturer is active'
    }),
    isVerified: z.boolean().optional().default(false).openapi({
        example: false,
        description: 'Whether the manufacturer is verified (admin only)'
    })
}).openapi('CreateManufacturerRequest');

export const updateManufacturerSchema = z.object({
    displayName: z.string().min(1).max(100).optional().openapi({
        example: 'Tesla Motors',
        description: 'Updated display name'
    }),
    logoImageId: z.string().optional().openapi({
        example: 'img_xyz789',
        description: 'Updated logo image file public ID'
    }),
    countryCode: z.string().regex(/^[A-Z]{2}$/).optional().openapi({
        example: 'US',
        description: 'Updated country code'
    }),
    description: z.string().optional().openapi({
        example: 'Updated description',
        description: 'Updated manufacturer description'
    }),
    isActive: z.boolean().optional().openapi({
        example: false,
        description: 'Updated active status'
    }),
    isVerified: z.boolean().optional().openapi({
        example: true,
        description: 'Updated verified status (admin only)'
    })
}).openapi('UpdateManufacturerRequest');

export const manufacturerResponseSchema = z.object({
    id: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Unique manufacturer ID'
    }),
    name: z.string().openapi({
        example: 'Tesla',
        description: 'Manufacturer name'
    }),
    displayName: z.string().openapi({
        example: 'Tesla, Inc.',
        description: 'Display name'
    }),
    slug: z.string().openapi({
        example: 'tesla',
        description: 'URL-friendly slug'
    }),
    logoImageId: z.string().nullable().openapi({
        example: 'img_abc123',
        description: 'Logo image file public ID'
    }),
    countryCode: z.string().regex(/^[A-Z]{2}$/).nullable().openapi({
        example: 'US',
        description: 'Country code'
    }),
    description: z.string().nullable().openapi({
        example: 'Electric vehicle manufacturer',
        description: 'Description'
    }),
    isActive: z.boolean().openapi({
        example: true,
        description: 'Active status'
    }),
    isVerified: z.boolean().openapi({
        example: true,
        description: 'Verified status'
    }),
    modelCount: z.number().optional().openapi({
        example: 5,
        description: 'Number of models'
    }),
    createdAt: z.string().datetime().openapi({
        example: '2024-01-01T00:00:00Z',
        description: 'Creation timestamp'
    }),
    updatedAt: z.string().datetime().openapi({
        example: '2024-01-01T00:00:00Z',
        description: 'Last update timestamp'
    })
}).openapi('Manufacturer');

export const manufacturerDetailResponseSchema = manufacturerResponseSchema.extend({
    createdBy: z.string().uuid().nullable().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Created by user ID'
    }),
    updatedBy: z.string().uuid().nullable().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Updated by user ID'
    })
}).openapi('ManufacturerDetail');

// ============================================
// QUERY SCHEMAS
// ============================================

export const manufacturerListQuerySchema = z.object({
    page: z.coerce.number().min(1).optional().default(1).openapi({
        example: 1,
        description: 'Page number'
    }),
    limit: z.coerce.number().min(1).max(100).optional().default(20).openapi({
        example: 20,
        description: 'Items per page'
    }),
    search: z.string().optional().openapi({
        example: 'Tesla',
        description: 'Search manufacturers by name'
    }),
    status: z.enum(['active', 'inactive', 'all']).optional().default('all').openapi({
        example: 'active',
        description: 'Filter by status'
    }),
    verified: z.coerce.boolean().optional().openapi({
        example: true,
        description: 'Filter by verified status'
    }),
    isActive: z.coerce.boolean().optional().openapi({
        example: true,
        description: 'Filter by active status'
    }),
    country: z.string().regex(/^[A-Z]{2}$/).optional().openapi({
        example: 'US',
        description: 'Filter by country code'
    }),
    sort: z.enum(['name', 'created_at', 'model_count']).optional().default('name').openapi({
        example: 'name',
        description: 'Sort field'
    }),
    order: z.enum(['asc', 'desc']).optional().default('asc').openapi({
        example: 'asc',
        description: 'Sort order'
    })
}).openapi('ManufacturerListQuery');

export const toggleManufacturerStatusSchema = z.object({
    isActive: z.boolean().openapi({
        example: false,
        description: 'New active status'
    })
}).openapi('ToggleStatusRequest');

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const manufacturerListResponseSchema = z.object({
    data: z.array(manufacturerResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    })
}).openapi('ManufacturerListResponse');

export const manufacturerSuccessResponseSchema = z.object({
    data: manufacturerResponseSchema
}).openapi('ManufacturerSuccessResponse');

export const manufacturerDetailSuccessResponseSchema = z.object({
    data: manufacturerDetailResponseSchema
}).openapi('ManufacturerDetailResponse');

// ============================================
// TYPE EXPORTS (Replace manual DTOs)
// ============================================

export type CreateManufacturerDto = z.infer<typeof createManufacturerSchema>;
export type UpdateManufacturerDto = z.infer<typeof updateManufacturerSchema>;
export type ManufacturerResponse = z.infer<typeof manufacturerResponseSchema>;
export type ManufacturerDetailResponse = z.infer<typeof manufacturerDetailResponseSchema>;
export type ManufacturerListQuery = z.infer<typeof manufacturerListQuerySchema>;
export type ManufacturerListResponse = z.infer<typeof manufacturerListResponseSchema>;
export type ToggleManufacturerStatus = z.infer<typeof toggleManufacturerStatusSchema>;