import { Hono } from 'hono';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerRepository } from './manufacturer.repository';
import {
    createManufacturerRoute,
    deleteManufacturerRoute,
    getAllManufacturersRoute,
    getManufacturerByIdRoute,
    updateManufacturerRoute
} from './manufacturer.schemas';

// Create manufacturer feature router
export function createManufacturerRouter() {
    const manufacturer = new Hono();
    
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