import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { ManufacturerService } from '@/features/core/manufacturer/manufacturer.service';
import { ManufacturerRepository } from '@/features/core/manufacturer/manufacturer.repository';
import { manufacturerFactory } from '@tests/fixtures/factories/manufacturer.factory';
import type { CreateManufacturerDto, UpdateManufacturerDto } from '@/schemas/core/manufacturer.schemas';

// Mock the repository
vi.mock('@/features/core/manufacturer/manufacturer.repository');

describe('ManufacturerService', () => {
  let service: ManufacturerService;
  let mockRepository: {
    findAll: Mock;
    findByPublicId: Mock;
    findByName: Mock;
    findBySlug: Mock;
    create: Mock;
    updateByPublicId: Mock;
    deleteByPublicId: Mock;
    toggleStatus: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRepository = {
      findAll: vi.fn(),
      findByPublicId: vi.fn(),
      findByName: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      updateByPublicId: vi.fn(),
      deleteByPublicId: vi.fn(),
      toggleStatus: vi.fn(),
    };

    // @ts-ignore - Mock implementation
    ManufacturerRepository.mockImplementation(() => mockRepository);
    
    service = new ManufacturerService(new ManufacturerRepository({} as any));
  });

  describe('getAllManufacturers', () => {
    it('should return paginated manufacturers', async () => {
      const mockData = manufacturerFactory.buildMany(5);
      const mockResult = {
        data: mockData,
        pagination: {
          page: 1,
          limit: 20,
          total: 5,
          totalPages: 1,
        },
      };

      mockRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAllManufacturers({
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(5);
      expect(result.pagination).toEqual(mockResult.pagination);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'all' }),
        expect.objectContaining({ sort: 'name', order: 'asc' }),
        expect.objectContaining({ page: 1, limit: 20 })
      );
    });

    it('should apply search filters correctly', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      await service.getAllManufacturers({
        search: 'Tesla',
        status: 'active',
        verified: true,
        country: 'US',
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Tesla',
          status: 'active',
          verified: true,
          country: 'US',
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('createManufacturer', () => {
    it('should create a manufacturer with valid data', async () => {
      const input = manufacturerFactory.buildCreateInput();
      const dbResult = manufacturerFactory.buildDbInsert(input);
      
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(dbResult);

      const result = await service.createManufacturer(input, 'user-123');

      expect(mockRepository.findByName).toHaveBeenCalledWith(input.name);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: input.name.trim(),
          displayName: input.displayName.trim(),
          createdBy: 'user-123',
        })
      );
      expect(result).toMatchObject({
        name: input.name,
        displayName: input.displayName,
      });
    });

    it('should throw error if manufacturer name already exists', async () => {
      const input = manufacturerFactory.buildCreateInput();
      const existing = manufacturerFactory.buildDbInsert({ name: input.name });
      
      mockRepository.findByName.mockResolvedValue(existing);

      await expect(service.createManufacturer(input))
        .rejects.toThrow(`Manufacturer with name "${input.name}" already exists`);
      
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should validate country code format', async () => {
      const input = manufacturerFactory.buildCreateInput({ countryCode: 'usa' });
      mockRepository.findByName.mockResolvedValue(null);

      await expect(service.createManufacturer(input))
        .rejects.toThrow('Country code must be a 2-letter uppercase ISO code');
    });

    it('should uppercase country code automatically', async () => {
      const input = manufacturerFactory.buildCreateInput({ countryCode: 'us' });
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(manufacturerFactory.buildDbInsert());

      await service.createManufacturer(input);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          countryCode: 'US',
        })
      );
    });
  });

  describe('updateManufacturerByPublicId', () => {
    it('should update manufacturer with valid data', async () => {
      const publicId = 'mfr_123';
      const input: UpdateManufacturerDto = manufacturerFactory.buildUpdateInput();
      const updated = manufacturerFactory.buildDbInsert(input);
      
      mockRepository.updateByPublicId.mockResolvedValue(updated);

      const result = await service.updateManufacturerByPublicId(
        publicId,
        input,
        'user-456'
      );

      expect(mockRepository.updateByPublicId).toHaveBeenCalledWith(
        publicId,
        expect.objectContaining({
          displayName: input.displayName?.trim(),
          updatedBy: 'user-456',
        })
      );
      expect(result).toBeTruthy();
    });

    it('should return null if manufacturer not found', async () => {
      mockRepository.updateByPublicId.mockResolvedValue(null);

      const result = await service.updateManufacturerByPublicId(
        'non-existent',
        { displayName: 'New Name' }
      );

      expect(result).toBeNull();
    });

    it('should validate country code format on update', async () => {
      const input = { countryCode: 'invalid' };

      await expect(
        service.updateManufacturerByPublicId('mfr_123', input)
      ).rejects.toThrow('Country code must be a 2-letter uppercase ISO code');
    });
  });

  describe('deleteManufacturerByPublicId', () => {
    it('should delete manufacturer successfully', async () => {
      const mockResult = { deleted: true, soft: false };
      mockRepository.deleteByPublicId.mockResolvedValue(mockResult);

      const result = await service.deleteManufacturerByPublicId('mfr_123');

      expect(result).toEqual(mockResult);
      expect(mockRepository.deleteByPublicId).toHaveBeenCalledWith('mfr_123');
    });
  });

  describe('toggleManufacturerStatus', () => {
    it('should toggle manufacturer status', async () => {
      const manufacturer = manufacturerFactory.buildDbInsert({ id: 1 });
      const updated = { ...manufacturer, isActive: false };
      
      mockRepository.findByPublicId.mockResolvedValue(manufacturer);
      mockRepository.toggleStatus.mockResolvedValue(updated);

      const result = await service.toggleManufacturerStatus(
        'mfr_123',
        false,
        'user-789'
      );

      expect(mockRepository.toggleStatus).toHaveBeenCalledWith(
        1,
        false,
        'user-789'
      );
      expect(result?.isActive).toBe(false);
    });

    it('should return null if manufacturer not found', async () => {
      mockRepository.findByPublicId.mockResolvedValue(null);

      const result = await service.toggleManufacturerStatus(
        'non-existent',
        false
      );

      expect(result).toBeNull();
      expect(mockRepository.toggleStatus).not.toHaveBeenCalled();
    });
  });

  describe('searchManufacturers', () => {
    it('should search manufacturers by query', async () => {
      const mockData = manufacturerFactory.buildMany(3);
      mockRepository.findAll.mockResolvedValue({
        data: mockData,
        pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
      });

      const result = await service.searchManufacturers('Tesla', 5);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { search: 'Tesla' },
        { sort: 'name', order: 'asc' },
        { page: 1, limit: 5 }
      );
      expect(result).toHaveLength(3);
    });
  });
});