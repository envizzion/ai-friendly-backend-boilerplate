import { Context } from 'hono';
import { ManufacturerService } from './manufacturer.service';
import { CreateManufacturerDto, UpdateManufacturerDto } from './manufacturer.dto';

export class ManufacturerController {
    private service: ManufacturerService;

    constructor(service: ManufacturerService) {
        this.service = service;
    }

    getAllManufacturers = async (c: Context) => {
        try {
            const manufacturers = await this.service.getAllManufacturers(c.req.query());
            return c.json(manufacturers);
        } catch (error) {
            console.error('Error getting all manufacturers:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    };

    getManufacturerById = async (c: Context) => {
        try {
            const publicId = c.req.param('id');
            const manufacturer = await this.service.getManufacturerByPublicId(publicId);
            if (!manufacturer) {
                return c.json({ error: 'Manufacturer not found' }, 404);
            }
            return c.json(manufacturer);
        } catch (error) {
            console.error('Error getting manufacturer by ID:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    };

    createManufacturer = async (c: Context) => {
        try {
            const data = await c.req.json<CreateManufacturerDto>();
            const manufacturer = await this.service.createManufacturer(data);
            return c.json(manufacturer, 201);
        } catch (error) {
            console.error('Error creating manufacturer:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    };

    updateManufacturer = async (c: Context) => {
        try {
            const publicId = c.req.param('id');
            const data = await c.req.json<UpdateManufacturerDto>();
            const manufacturer = await this.service.updateManufacturerByPublicId(publicId, data);
            if (!manufacturer) {
                return c.json({ error: 'Manufacturer not found' }, 404);
            }
            return c.json(manufacturer);
        } catch (error) {
            console.error('Error updating manufacturer:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    };

    deleteManufacturer = async (c: Context) => {
        try {
            const publicId = c.req.param('id');
            await this.service.deleteManufacturerByPublicId(publicId);
            return new Response(null, { status: 204 });
        } catch (error) {
            console.error('Error deleting manufacturer:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    };
}