import { createRoute, z } from '@hono/zod-openapi';

// ============================================
// BASE SCHEMAS
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

export const manufacturerSchema = z.object({
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

export const manufacturerDetailSchema = manufacturerSchema.extend({
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

export const toggleStatusSchema = z.object({
    isActive: z.boolean().openapi({
        example: false,
        description: 'New active status'
    })
}).openapi('ToggleStatusRequest');

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const paginationSchema = z.object({
    page: z.number().openapi({
        example: 1,
        description: 'Current page'
    }),
    limit: z.number().openapi({
        example: 20,
        description: 'Items per page'
    }),
    total: z.number().openapi({
        example: 100,
        description: 'Total items'
    }),
    totalPages: z.number().openapi({
        example: 5,
        description: 'Total pages'
    }),
    hasNext: z.boolean().openapi({
        example: true,
        description: 'Has next page'
    }),
    hasPrev: z.boolean().openapi({
        example: false,
        description: 'Has previous page'
    })
}).openapi('Pagination');

export const manufacturerListResponseSchema = z.object({
    data: z.array(manufacturerSchema),
    pagination: paginationSchema
}).openapi('ManufacturerListResponse');

export const successResponseSchema = z.object({
    data: manufacturerSchema
}).openapi('ManufacturerSuccessResponse');

export const detailResponseSchema = z.object({
    data: manufacturerDetailSchema
}).openapi('ManufacturerDetailResponse');

// ============================================
// ROUTE DEFINITIONS
// ============================================

export const getAllManufacturersRoute = createRoute({
    method: 'get',
    path: '',
    tags: ['Manufacturers'],
    summary: 'List manufacturers',
    description: 'Get all manufacturers with filtering, sorting, and pagination',
    request: {
        query: manufacturerListQuerySchema
    },
    responses: {
        200: {
            description: 'List of manufacturers',
            content: {
                'application/json': {
                    schema: manufacturerListResponseSchema
                }
            }
        },
        500: {
            description: 'Internal server error'
        }
    }
});

export const getManufacturerByIdRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Manufacturers'],
    summary: 'Get single manufacturer',
    description: 'Get a manufacturer by ID with detailed information',
    request: {
        params: z.object({
            id: z.string().uuid().openapi({
                example: '123e4567-e89b-12d3-a456-426614174000',
                description: 'Manufacturer public ID'
            })
        })
    },
    responses: {
        200: {
            description: 'Manufacturer details',
            content: {
                'application/json': {
                    schema: detailResponseSchema
                }
            }
        },
        404: {
            description: 'Manufacturer not found'
        },
        500: {
            description: 'Internal server error'
        }
    }
});

export const createManufacturerRoute = createRoute({
    method: 'post',
    path: '',
    tags: ['Manufacturers'],
    summary: 'Create manufacturer',
    description: 'Create a new manufacturer',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createManufacturerSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: 'Manufacturer created',
            content: {
                'application/json': {
                    schema: successResponseSchema
                }
            }
        },
        400: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.object({
                            code: z.string(),
                            message: z.string(),
                            details: z.array(z.object({
                                field: z.string(),
                                message: z.string()
                            })).optional()
                        })
                    })
                }
            }
        },
        500: {
            description: 'Internal server error'
        }
    }
});

export const updateManufacturerRoute = createRoute({
    method: 'put',
    path: '/:id',
    tags: ['Manufacturers'],
    summary: 'Update manufacturer',
    description: 'Update an existing manufacturer',
    request: {
        params: z.object({
            id: z.string().uuid().openapi({
                example: '123e4567-e89b-12d3-a456-426614174000',
                description: 'Manufacturer public ID'
            })
        }),
        body: {
            content: {
                'application/json': {
                    schema: updateManufacturerSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Manufacturer updated',
            content: {
                'application/json': {
                    schema: detailResponseSchema
                }
            }
        },
        404: {
            description: 'Manufacturer not found'
        },
        400: {
            description: 'Validation error'
        },
        500: {
            description: 'Internal server error'
        }
    }
});

export const deleteManufacturerRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Manufacturers'],
    summary: 'Delete manufacturer',
    description: 'Delete a manufacturer (soft delete if models exist, hard delete otherwise)',
    request: {
        params: z.object({
            id: z.string().uuid().openapi({
                example: '123e4567-e89b-12d3-a456-426614174000',
                description: 'Manufacturer public ID'
            })
        })
    },
    responses: {
        204: {
            description: 'Manufacturer deleted'
        },
        404: {
            description: 'Manufacturer not found'
        },
        500: {
            description: 'Internal server error'
        }
    }
});