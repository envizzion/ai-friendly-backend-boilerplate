import {
    CreateManufacturerDto,
    UpdateManufacturerDto,
    ManufacturerResponse,
    ManufacturerDetailResponse,
    ManufacturerListQuery,
    ManufacturerListResponse
} from '../../../schemas/core/manufacturer.schemas.js';
import { ManufacturerRepository } from './manufacturer.repository.js';

// Helper function to convert DB entity to DTO
function toManufacturerDto(manufacturer: any): ManufacturerResponse {
    return {
        id: manufacturer.publicId,
        name: manufacturer.name,
        displayName: manufacturer.displayName,
        slug: manufacturer.slug,
        logoImageId: manufacturer.logoImagePublicId || undefined,
        countryCode: manufacturer.countryCode || undefined,
        description: manufacturer.description || undefined,
        isActive: manufacturer.isActive,
        isVerified: manufacturer.isVerified,
        modelCount: manufacturer.modelCount ? Number(manufacturer.modelCount) : undefined,
        createdAt: manufacturer.createdAt.toString(),
        updatedAt: manufacturer.updatedAt?.toString() || manufacturer.createdAt.toString(),
    };
}

// Helper function to convert DB entity to detailed DTO
function toManufacturerDetailDto(manufacturer: any): ManufacturerDetailResponse {
    return {
        ...toManufacturerDto(manufacturer),
        createdBy: manufacturer.createdBy || undefined,
        updatedBy: manufacturer.updatedBy || undefined,
    };
}

export class ManufacturerService {
    private repository: ManufacturerRepository;

    constructor(manufacturerRepository: ManufacturerRepository) {
        this.repository = manufacturerRepository;
    }

    /**
     * Get all manufacturers with filtering, sorting, and pagination
     */
    async getAllManufacturers(query: ManufacturerListQuery): Promise<ManufacturerListResponse> {
        const filters = {
            search: query.search,
            status: query.status || 'all',
            verified: query.verified,
            country: query.country,
            isActive: query.isActive,
        };

        const sortOptions = {
            sort: query.sort || 'name',
            order: query.order || 'asc',
        };

        const pagination = {
            page: query.page || 1,
            limit: Math.min(query.limit || 20, 100), // Max 100 items per page
        };

        const result = await this.repository.findAll(filters, sortOptions, pagination);

        return {
            data: result.data.map(m => toManufacturerDto(m)),
            pagination: result.pagination,
        };
    }

    /**
     * Get a manufacturer by public ID with detailed information
     */
    async getManufacturerById(publicId: string): Promise<ManufacturerDetailResponse | null> {
        const manufacturer = await this.repository.findByPublicId(publicId);
        return manufacturer ? toManufacturerDetailDto(manufacturer) : null;
    }

    /**
     * Get a manufacturer by public ID with detailed information
     */
    async getManufacturerByPublicId(publicId: string): Promise<ManufacturerDetailResponse | null> {
        const manufacturer = await this.repository.findByPublicId(publicId);
        return manufacturer ? toManufacturerDetailDto(manufacturer) : null;
    }

    /**
     * Get a manufacturer by name (for uniqueness validation)
     */
    async getManufacturerByName(name: string): Promise<ManufacturerResponse | null> {
        const manufacturer = await this.repository.findByName(name);
        return manufacturer ? toManufacturerDto(manufacturer) : null;
    }

    /**
     * Get a manufacturer by slug
     */
    async getManufacturerBySlug(slug: string): Promise<ManufacturerDetailResponse | null> {
        const manufacturer = await this.repository.findBySlug(slug);
        return manufacturer ? toManufacturerDetailDto(manufacturer) : null;
    }

    /**
     * Create a new manufacturer
     */
    async createManufacturer(dto: CreateManufacturerDto, createdBy?: string): Promise<ManufacturerResponse> {
        // Validate uniqueness
        const existingManufacturer = await this.repository.findByName(dto.name);
        if (existingManufacturer) {
            throw new Error(`Manufacturer with name "${dto.name}" already exists`);
        }

        // Validate and normalize country code format if provided
        const normalizedCountryCode = dto.countryCode?.toUpperCase();
        if (normalizedCountryCode && !/^[A-Z]{2}$/.test(normalizedCountryCode)) {
            throw new Error('Country code must be a 2-letter uppercase ISO code');
        }

        const manufacturerData = {
            name: dto.name.trim(),
            displayName: dto.displayName.trim(),
            logoImageId: dto.logoImageId?.trim(),
            countryCode: normalizedCountryCode,
            description: dto.description?.trim(),
            isActive: dto.isActive ?? true,
            isVerified: dto.isVerified ?? false,
            createdBy,
        };

        const manufacturer = await this.repository.create(manufacturerData);
        return toManufacturerDto(manufacturer);
    }

    /**
     * Update a manufacturer by public ID
     */
    async updateManufacturerByPublicId(
        publicId: string,
        dto: UpdateManufacturerDto,
        updatedBy?: string
    ): Promise<ManufacturerDetailResponse | null> {
        // Validate and normalize country code format if provided
        const normalizedCountryCode = dto.countryCode?.toUpperCase();
        if (normalizedCountryCode && !/^[A-Z]{2}$/.test(normalizedCountryCode)) {
            throw new Error('Country code must be a 2-letter uppercase ISO code');
        }

        const updateData = {
            displayName: dto.displayName?.trim(),
            logoImageId: dto.logoImageId?.trim(),
            countryCode: normalizedCountryCode,
            description: dto.description?.trim(),
            isActive: dto.isActive,
            isVerified: dto.isVerified,
            updatedBy,
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key =>
            updateData[key as keyof typeof updateData] === undefined &&
            delete updateData[key as keyof typeof updateData]
        );

        const manufacturer = await this.repository.updateByPublicId(publicId, updateData);
        return manufacturer ? toManufacturerDetailDto(manufacturer) : null;
    }

    /**
     * Toggle manufacturer status (active/inactive)
     */
    async toggleManufacturerStatus(
        publicId: string,
        isActive: boolean,
        updatedBy?: string
    ): Promise<ManufacturerResponse | null> {
        // First get the manufacturer to get internal ID
        const manufacturer = await this.repository.findByPublicId(publicId);
        if (!manufacturer) {
            return null;
        }

        const updated = await this.repository.toggleStatus(manufacturer.id, isActive, updatedBy);
        return updated ? toManufacturerDto(updated) : null;
    }

    /**
     * Delete a manufacturer (soft or hard delete based on relationships)
     */
    async deleteManufacturerByPublicId(publicId: string): Promise<{
        deleted: boolean;
        soft: boolean;
        reason?: string
    }> {
        return this.repository.deleteByPublicId(publicId);
    }

    /**
     * Verify a manufacturer (admin only)
     */
    async verifyManufacturer(publicId: string, updatedBy?: string): Promise<ManufacturerResponse | null> {
        const updateData = {
            isVerified: true,
            updatedBy,
        };

        const manufacturer = await this.repository.updateByPublicId(publicId, updateData);
        return manufacturer ? toManufacturerDto(manufacturer) : null;
    }

    /**
     * Batch update manufacturer status
     */
    async batchUpdateStatus(
        publicIds: string[],
        isActive: boolean,
        updatedBy?: string
    ): Promise<{ success: string[]; failed: string[] }> {
        const success: string[] = [];
        const failed: string[] = [];

        for (const publicId of publicIds) {
            try {
                const result = await this.toggleManufacturerStatus(publicId, isActive, updatedBy);
                if (result) {
                    success.push(publicId);
                } else {
                    failed.push(publicId);
                }
            } catch (error) {
                failed.push(publicId);
            }
        }

        return { success, failed };
    }

    /**
     * Search manufacturers by name or display name
     */
    async searchManufacturers(query: string, limit: number = 10): Promise<ManufacturerResponse[]> {
        const searchResult = await this.repository.findAll(
            { search: query.trim() },
            { sort: 'name', order: 'asc' },
            { page: 1, limit: Math.min(limit, 50) }
        );

        return searchResult.data.map(m => toManufacturerDto(m));
    }
}