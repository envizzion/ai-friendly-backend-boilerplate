import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { ManufacturerController } from '@/features/core/manufacturer/manufacturer.controller';
import { ManufacturerService } from '@/features/core/manufacturer/manufacturer.service';
import { manufacturerFactory } from '@tests/fixtures/factories/manufacturer.factory';
import { Context } from 'hono';
import { ZodError } from 'zod';

// Mock the service
vi.mock('@/features/core/manufacturer/manufacturer.service');

describe('ManufacturerController', () => {
  let controller: ManufacturerController;
  let mockService: {
    getAllManufacturers: Mock;
    getManufacturerByPublicId: Mock;
    createManufacturer: Mock;
    updateManufacturerByPublicId: Mock;
    deleteManufacturerByPublicId: Mock;
  };
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockService = {
      getAllManufacturers: vi.fn(),
      getManufacturerByPublicId: vi.fn(),
      createManufacturer: vi.fn(),
      updateManufacturerByPublicId: vi.fn(),
      deleteManufacturerByPublicId: vi.fn(),
    };

    // @ts-ignore - Mock implementation
    ManufacturerService.mockImplementation(() => mockService);
    
    controller = new ManufacturerController(new ManufacturerService({} as any));

    // Create mock context
    mockContext = {
      req: {
        query: vi.fn().mockReturnValue({}),
        param: vi.fn(),
        json: vi.fn(),
      },
      json: vi.fn().mockReturnValue(new Response()),
      text: vi.fn().mockReturnValue(new Response()),
      status: vi.fn().mockReturnThis(),
    };
  });

  describe('getAllManufacturers', () => {
    it('should return manufacturers list with valid query params', async () => {
      const mockResponse = {
        data: manufacturerFactory.buildMany(3),
        pagination: { page: 1, limit: 20, total: 3, totalPages: 1 },
      };

      mockContext.req.query.mockReturnValue({
        page: '2',
        limit: '10',
        search: 'Tesla',
      });
      mockService.getAllManufacturers.mockResolvedValue(mockResponse);

      await controller.getAllManufacturers(mockContext as Context);

      expect(mockService.getAllManufacturers).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: 'Tesla',
        status: 'all',
        sort: 'name',
        order: 'asc',
      });
      expect(mockContext.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle invalid query parameters', async () => {
      mockContext.req.query.mockReturnValue({
        page: 'invalid',
        limit: '200', // exceeds max
      });

      await controller.getAllManufacturers(mockContext as Context);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Internal server error' }),
        500
      );
    });

    it('should handle service errors', async () => {
      mockService.getAllManufacturers.mockRejectedValue(new Error('Database error'));

      await controller.getAllManufacturers(mockContext as Context);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        500
      );
    });
  });

  describe('getManufacturerById', () => {
    it('should return manufacturer by ID', async () => {
      const manufacturer = manufacturerFactory.buildResponse();
      mockContext.req.param.mockReturnValue('mfr_123');
      mockService.getManufacturerByPublicId.mockResolvedValue(manufacturer);

      await controller.getManufacturerById(mockContext as Context);

      expect(mockService.getManufacturerByPublicId).toHaveBeenCalledWith('mfr_123');
      expect(mockContext.json).toHaveBeenCalledWith(manufacturer);
    });

    it('should return 404 if manufacturer not found', async () => {
      mockContext.req.param.mockReturnValue('non-existent');
      mockService.getManufacturerByPublicId.mockResolvedValue(null);

      await controller.getManufacturerById(mockContext as Context);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Manufacturer not found' },
        404
      );
    });
  });

  describe('createManufacturer', () => {
    it('should create manufacturer with valid data', async () => {
      const input = manufacturerFactory.buildCreateInput();
      const created = manufacturerFactory.buildResponse(input);
      
      mockContext.req.json.mockResolvedValue(input);
      mockService.createManufacturer.mockResolvedValue(created);

      await controller.createManufacturer(mockContext as Context);

      expect(mockService.createManufacturer).toHaveBeenCalledWith(input);
      expect(mockContext.json).toHaveBeenCalledWith(created, 201);
    });

    it('should handle service errors', async () => {
      const input = manufacturerFactory.buildCreateInput();
      mockContext.req.json.mockResolvedValue(input);
      mockService.createManufacturer.mockRejectedValue(new Error('Service error'));

      await controller.createManufacturer(mockContext as Context);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        500
      );
    });
  });

  describe('updateManufacturer', () => {
    it('should update manufacturer with valid data', async () => {
      const input = manufacturerFactory.buildUpdateInput();
      const updated = manufacturerFactory.buildResponse(input);
      
      mockContext.req.param.mockReturnValue('mfr_123');
      mockContext.req.json.mockResolvedValue(input);
      mockService.updateManufacturerByPublicId.mockResolvedValue(updated);

      await controller.updateManufacturer(mockContext as Context);

      expect(mockService.updateManufacturerByPublicId).toHaveBeenCalledWith(
        'mfr_123',
        input
      );
      expect(mockContext.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 if manufacturer not found', async () => {
      mockContext.req.param.mockReturnValue('non-existent');
      mockContext.req.json.mockResolvedValue({});
      mockService.updateManufacturerByPublicId.mockResolvedValue(null);

      await controller.updateManufacturer(mockContext as Context);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Manufacturer not found' },
        404
      );
    });
  });

  describe('deleteManufacturer', () => {
    it('should delete manufacturer successfully', async () => {
      mockContext.req.param.mockReturnValue('mfr_123');
      mockService.deleteManufacturerByPublicId.mockResolvedValue({
        deleted: true,
        soft: false,
      });

      const response = await controller.deleteManufacturer(mockContext as Context);

      expect(mockService.deleteManufacturerByPublicId).toHaveBeenCalledWith('mfr_123');
      expect(response.status).toBe(204);
    });

    it('should handle deletion errors', async () => {
      mockContext.req.param.mockReturnValue('mfr_123');
      mockService.deleteManufacturerByPublicId.mockRejectedValue(
        new Error('Cannot delete')
      );

      await controller.deleteManufacturer(mockContext as Context);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        500
      );
    });
  });
});