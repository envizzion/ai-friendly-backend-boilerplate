import type { Manufacturer } from '../../shared/database/schema/generated';
import { Selectable } from 'kysely';

export interface ManufacturerDto {
    id: string;
    name: string;
    displayName: string;
    slug: string;
    logoImageId?: string;
    countryCode?: string;
    description?: string;
    isActive: boolean;
    isVerified: boolean;
    modelCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ManufacturerDetailDto extends ManufacturerDto {
    createdBy?: string;
    updatedBy?: string;
}

export interface CreateManufacturerDto {
    name: string;
    displayName: string;
    logoImageId?: string;
    countryCode?: string;
    description?: string;
    isActive?: boolean;
    isVerified?: boolean;
}

export interface UpdateManufacturerDto {
    displayName?: string;
    logoImageId?: string;
    countryCode?: string;
    description?: string;
    isActive?: boolean;
    isVerified?: boolean;
}

export interface ManufacturerListQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    verified?: boolean;
    isActive?: boolean;
    country?: string;
    sort?: 'name' | 'created_at' | 'model_count';
    order?: 'asc' | 'desc';
}

export interface ManufacturerListResponseDto {
    data: ManufacturerDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Helper function to convert DB entity to DTO
export function toManufacturerDto(manufacturer: Partial<Selectable<Manufacturer>> & {
    id: number;
    publicId: string;
    name: string;
    displayName: string;
    slug: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    modelCount?: string | number | bigint;
    logoImagePublicId?: string | null;
}): ManufacturerDto {
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
export function toManufacturerDetailDto(manufacturer: Partial<Selectable<Manufacturer>> & {
    id: number;
    publicId: string;
    name: string;
    displayName: string;
    slug: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    modelCount?: string | number | bigint;
    logoImagePublicId?: string | null;
}): ManufacturerDetailDto {
    return {
        ...toManufacturerDto(manufacturer),
        createdBy: manufacturer.createdBy || undefined,
        updatedBy: manufacturer.updatedBy || undefined,
    };
}