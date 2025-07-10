import { OpenAPIHono } from '@hono/zod-openapi';
import { ManufacturerController } from './manufacturer.controller.js';
import { ManufacturerRepository } from './manufacturer.repository.js';
import {
    createManufacturerRoute,
    deleteManufacturerRoute,
    getAllManufacturersRoute,
    getManufacturerByIdRoute,
    updateManufacturerRoute
} from './manufacturer.schemas.js';
import { ManufacturerService } from './manufacturer.service.js';

// Create manufacturer feature router
export function createManufacturerRouter() {
    const manufacturer = new OpenAPIHono();

    // Create dependencies
    const manufacturerRepository = new ManufacturerRepository();
    const manufacturerService = new ManufacturerService(manufacturerRepository);
    const manufacturerController = new ManufacturerController(manufacturerService);

    // Register routes
    manufacturer.openapi(getAllManufacturersRoute, manufacturerController.getAllManufacturers);
    manufacturer.openapi(getManufacturerByIdRoute, manufacturerController.getManufacturerById);
    manufacturer.openapi(createManufacturerRoute, manufacturerController.createManufacturer);
    manufacturer.openapi(updateManufacturerRoute, manufacturerController.updateManufacturer);
    manufacturer.openapi(deleteManufacturerRoute, manufacturerController.deleteManufacturer);

    return manufacturer;
}