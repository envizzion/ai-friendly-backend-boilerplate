import { createRoute } from '@hono/zod-openapi';
import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { ManufacturerController } from './manufacturer.controller.js';
import { ManufacturerRepository } from './manufacturer.repository.js';
import { ManufacturerService } from './manufacturer.service.js';
import {
    createManufacturerSchema,
    updateManufacturerSchema,
    manufacturerResponseSchema,
    manufacturerDetailResponseSchema,
    manufacturerListResponseSchema,
    manufacturerListQuerySchema,
    manufacturerSuccessResponseSchema,
    manufacturerDetailSuccessResponseSchema
} from '../../../schemas/core/manufacturer.schemas.js';

// ============================================
// ENHANCED ROUTE DEFINITIONS WITH DOMAIN TAGGING
// ============================================

export const getAllManufacturersRoute = createRoute({
    method: 'get',
    path: '',
    tags: ['core'], // 🎯 Domain tagging for OpenAPI separation
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
    tags: ['core'], // 🎯 Domain tagging
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
                    schema: manufacturerDetailSuccessResponseSchema
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
    tags: ['core'], // 🎯 Domain tagging
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
                    schema: manufacturerSuccessResponseSchema
                }
            }
        },
        400: {
            description: 'Validation error'
        },
        500: {
            description: 'Internal server error'
        }
    }
});

export const updateManufacturerRoute = createRoute({
    method: 'put',
    path: '/:id',
    tags: ['core'], // 🎯 Domain tagging
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
                    schema: manufacturerDetailSuccessResponseSchema
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
    tags: ['core'], // 🎯 Domain tagging
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

// ============================================
// ENHANCED ROUTER FACTORY
// ============================================

export function createManufacturerRouter() {
    const manufacturer = new OpenAPIHono();

    // Create dependencies
    const manufacturerRepository = new ManufacturerRepository();
    const manufacturerService = new ManufacturerService(manufacturerRepository);
    const manufacturerController = new ManufacturerController(manufacturerService);

    // Register routes with centralized schemas
    manufacturer.openapi(getAllManufacturersRoute, manufacturerController.getAllManufacturers);
    manufacturer.openapi(getManufacturerByIdRoute, manufacturerController.getManufacturerById);
    manufacturer.openapi(createManufacturerRoute, manufacturerController.createManufacturer);
    manufacturer.openapi(updateManufacturerRoute, manufacturerController.updateManufacturer);
    manufacturer.openapi(deleteManufacturerRoute, manufacturerController.deleteManufacturer);

    return manufacturer;
}

export const manufacturer = createManufacturerRouter();