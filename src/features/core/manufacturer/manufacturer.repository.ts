import { dbConn, executeQuery } from '@database/database.js';
import { CoreDB } from '@schemas/index.js';
import { Kysely, sql } from 'kysely';

export interface ManufacturerFilters {
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    verified?: boolean;
    isActive?: boolean;
    country?: string;
}

export interface ManufacturerSortOptions {
    sort?: 'name' | 'created_at' | 'model_count';
    order?: 'asc' | 'desc';
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface CreateManufacturerData {
    name: string;
    displayName: string;
    logoImageId?: string; // This is the publicId from the files table
    countryCode?: string;
    description?: string;
    isActive?: boolean;
    isVerified?: boolean;
    createdBy?: string;
}

export interface UpdateManufacturerData {
    displayName?: string;
    logoImageId?: string; // This is the publicId from the files table
    countryCode?: string;
    description?: string;
    isActive?: boolean;
    isVerified?: boolean;
    updatedBy?: string;
}

export class ManufacturerRepository {
    constructor(private db: Kysely<CoreDB> = dbConn) { }

    /**
     * Helper function to convert file publicId to database ID
     */
    private async getFileIdFromPublicId(publicId: string): Promise<number | null> {
        const file = await this.db
            .selectFrom('file')
            .select('id')
            .where('publicId', '=', publicId)
            .executeTakeFirst();

        return file ? file.id : null;
    }
    /**
     * Find all manufacturers with filters, sorting, and pagination
     */
    async findAll(
        filters: ManufacturerFilters = {},
        sortOptions: ManufacturerSortOptions = {},
        pagination: PaginationOptions = {}
    ) {
        const { search, status = 'all', verified, isActive, country } = filters;
        const { sort = 'name', order = 'asc' } = sortOptions;
        const { page = 1, limit = 20 } = pagination;

        const offset = (page - 1) * limit;

        let query = this.db
            .selectFrom('manufacturer')
            .leftJoin('model', 'manufacturer.id', 'model.manufacturerId')
            .leftJoin('file', 'manufacturer.logoImageId', 'file.id')
            .select((eb) => [
                'manufacturer.id',
                'manufacturer.publicId',
                'manufacturer.name',
                'manufacturer.displayName',
                'manufacturer.slug',
                'manufacturer.logoImageId',
                'file.publicId as logoImagePublicId',
                'manufacturer.countryCode',
                'manufacturer.isActive',
                'manufacturer.isVerified',
                'manufacturer.createdAt',
                eb.fn.count('model.id').as('modelCount'),
            ])
            .groupBy([
                'manufacturer.id',
                'manufacturer.publicId',
                'manufacturer.name',
                'manufacturer.displayName',
                'manufacturer.slug',
                'manufacturer.logoImageId',
                'file.publicId',
                'manufacturer.countryCode',
                'manufacturer.isActive',
                'manufacturer.isVerified',
                'manufacturer.createdAt',
            ]);

        // Apply filters
        if (search) {
            query = query.where((eb) =>
                eb.or([
                    eb('manufacturer.name', 'ilike', `%${search}%`),
                    eb('manufacturer.displayName', 'ilike', `%${search}%`),
                ])
            );
        }

        if (status !== 'all') {
            query = query.where('manufacturer.isActive', '=', status === 'active');
        }

        if (verified !== undefined) {
            query = query.where('manufacturer.isVerified', '=', verified);
        }

        if (country) {
            query = query.where('manufacturer.countryCode', '=', country);
        }

        if (isActive !== undefined) {
            query = query.where('manufacturer.isActive', '=', isActive);
        }

        // Apply sorting
        if (sort === 'model_count') {
            query = query.orderBy(sql`COUNT(model.id)`, order);
        } else if (sort === 'created_at') {
            query = query.orderBy('manufacturer.createdAt', order);
        } else {
            query = query.orderBy('manufacturer.name', order);
        }

        // Get total count for pagination
        let countQuery = this.db
            .selectFrom('manufacturer')
            .select((eb) => eb.fn.count('manufacturer.id').as('count'));

        // Apply same filters for count
        if (search) {
            countQuery = countQuery.where((eb) =>
                eb.or([
                    eb('manufacturer.name', 'ilike', `%${search}%`),
                    eb('manufacturer.displayName', 'ilike', `%${search}%`),
                ])
            );
        }
        if (status !== 'all') {
            countQuery = countQuery.where('manufacturer.isActive', '=', status === 'active');
        }
        if (verified !== undefined) {
            countQuery = countQuery.where('manufacturer.isVerified', '=', verified);
        }
        if (country) {
            countQuery = countQuery.where('manufacturer.countryCode', '=', country);
        }
        if (isActive !== undefined) {
            countQuery = countQuery.where('manufacturer.isActive', '=', isActive);
        }

        const [data, countResult] = await Promise.all([
            query.limit(limit).offset(offset).execute(),
            countQuery.executeTakeFirst(),
        ]);

        const total = Number(countResult?.count || 0);
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    /**
     * Find a manufacturer by ID
     */
    async findById(id: number) {
        return executeQuery((db) =>
            db
                .selectFrom('manufacturer')
                .leftJoin('model', 'manufacturer.id', 'model.manufacturerId')
                .leftJoin('file', 'manufacturer.logoImageId', 'file.id')
                .select((eb) => [
                    'manufacturer.id',
                    'manufacturer.publicId',
                    'manufacturer.name',
                    'manufacturer.displayName',
                    'manufacturer.slug',
                    'manufacturer.logoImageId',
                    'file.publicId as logoImagePublicId',
                    'manufacturer.countryCode',
                    'manufacturer.description',
                    'manufacturer.isActive',
                    'manufacturer.isVerified',
                    'manufacturer.createdAt',
                    'manufacturer.updatedAt',
                    'manufacturer.createdBy',
                    'manufacturer.updatedBy',
                    eb.fn.count('model.id').as('modelCount'),
                ])
                .where('manufacturer.id', '=', id)
                .groupBy([
                    'manufacturer.id',
                    'manufacturer.publicId',
                    'manufacturer.name',
                    'manufacturer.displayName',
                    'manufacturer.slug',
                    'manufacturer.logoImageId',
                    'file.publicId',
                    'manufacturer.countryCode',
                    'manufacturer.description',
                    'manufacturer.isActive',
                    'manufacturer.isVerified',
                    'manufacturer.createdAt',
                    'manufacturer.updatedAt',
                    'manufacturer.createdBy',
                    'manufacturer.updatedBy',
                ])
                .executeTakeFirst()
        );
    }

    /**
     * Find a manufacturer by public ID
     */
    async findByPublicId(publicId: string) {
        return executeQuery((db) =>
            db
                .selectFrom('manufacturer')
                .leftJoin('model', 'manufacturer.id', 'model.manufacturerId')
                .leftJoin('file', 'manufacturer.logoImageId', 'file.id')
                .select((eb) => [
                    'manufacturer.id',
                    'manufacturer.publicId',
                    'manufacturer.name',
                    'manufacturer.displayName',
                    'manufacturer.slug',
                    'manufacturer.logoImageId',
                    'file.publicId as logoImagePublicId',
                    'manufacturer.countryCode',
                    'manufacturer.description',
                    'manufacturer.isActive',
                    'manufacturer.isVerified',
                    'manufacturer.createdAt',
                    'manufacturer.updatedAt',
                    'manufacturer.createdBy',
                    'manufacturer.updatedBy',
                    eb.fn.count('model.id').as('modelCount'),
                ])
                .where('manufacturer.publicId', '=', publicId)
                .groupBy([
                    'manufacturer.id',
                    'manufacturer.publicId',
                    'manufacturer.name',
                    'manufacturer.displayName',
                    'manufacturer.slug',
                    'manufacturer.logoImageId',
                    'file.publicId',
                    'manufacturer.countryCode',
                    'manufacturer.description',
                    'manufacturer.isActive',
                    'manufacturer.isVerified',
                    'manufacturer.createdAt',
                    'manufacturer.updatedAt',
                    'manufacturer.createdBy',
                    'manufacturer.updatedBy',
                ])
                .executeTakeFirst()
        );
    }

    /**
     * Find a manufacturer by name
     */
    async findByName(name: string) {
        return executeQuery((db) =>
            db
                .selectFrom('manufacturer')
                .selectAll()
                .where('manufacturer.name', '=', name)
                .executeTakeFirst()
        );
    }

    /**
     * Find a manufacturer by slug
     */
    async findBySlug(slug: string) {
        return executeQuery((db) =>
            db
                .selectFrom('manufacturer')
                .leftJoin('model', 'manufacturer.id', 'model.manufacturerId')
                .leftJoin('file', 'manufacturer.logoImageId', 'file.id')
                .select((eb) => [
                    'manufacturer.id',
                    'manufacturer.publicId',
                    'manufacturer.name',
                    'manufacturer.displayName',
                    'manufacturer.slug',
                    'manufacturer.logoImageId',
                    'file.publicId as logoImagePublicId',
                    'manufacturer.countryCode',
                    'manufacturer.description',
                    'manufacturer.isActive',
                    'manufacturer.isVerified',
                    'manufacturer.createdAt',
                    'manufacturer.updatedAt',
                    'manufacturer.createdBy',
                    'manufacturer.updatedBy',
                    eb.fn.count('model.id').as('modelCount'),
                ])
                .where('manufacturer.slug', '=', slug)
                .groupBy([
                    'manufacturer.id',
                    'manufacturer.publicId',
                    'manufacturer.name',
                    'manufacturer.displayName',
                    'manufacturer.slug',
                    'manufacturer.logoImageId',
                    'file.publicId',
                    'manufacturer.countryCode',
                    'manufacturer.description',
                    'manufacturer.isActive',
                    'manufacturer.isVerified',
                    'manufacturer.createdAt',
                    'manufacturer.updatedAt',
                    'manufacturer.createdBy',
                    'manufacturer.updatedBy',
                ])
                .executeTakeFirst()
        );
    }

    /**
     * Create a new manufacturer
     */
    async create(data: CreateManufacturerData) {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        // Convert logoImageId from publicId to database ID if provided
        const logoImageDbId = data.logoImageId ? await this.getFileIdFromPublicId(data.logoImageId) : null;

        return executeQuery((db) =>
            db
                .insertInto('manufacturer')
                .values({
                    name: data.name,
                    displayName: data.displayName,
                    slug,
                    logoImageId: logoImageDbId,
                    countryCode: data.countryCode,
                    description: data.description,
                    isActive: data.isActive ?? true,
                    isVerified: data.isVerified ?? false,
                    createdBy: data.createdBy,
                    updatedBy: data.createdBy,
                })
                .returningAll()
                .executeTakeFirstOrThrow()
        );
    }

    /**
     * Update a manufacturer by ID
     */
    async update(id: number, data: UpdateManufacturerData) {
        // Convert logoImageId from publicId to database ID if provided
        const logoImageDbId = data.logoImageId ? await this.getFileIdFromPublicId(data.logoImageId) : undefined;

        return executeQuery((db) =>
            db
                .updateTable('manufacturer')
                .set({
                    displayName: data.displayName,
                    logoImageId: logoImageDbId,
                    countryCode: data.countryCode,
                    description: data.description,
                    isActive: data.isActive,
                    isVerified: data.isVerified,
                    updatedBy: data.updatedBy,
                    updatedAt: sql`NOW()`,
                })
                .where('id', '=', id)
                .returningAll()
                .executeTakeFirst()
        );
    }

    /**
     * Update a manufacturer by public ID
     */
    async updateByPublicId(publicId: string, data: UpdateManufacturerData) {
        // Convert logoImageId from publicId to database ID if provided
        const logoImageDbId = data.logoImageId ? await this.getFileIdFromPublicId(data.logoImageId) : undefined;

        return executeQuery((db) =>
            db
                .updateTable('manufacturer')
                .set({
                    displayName: data.displayName,
                    logoImageId: logoImageDbId,
                    countryCode: data.countryCode,
                    description: data.description,
                    isActive: data.isActive,
                    isVerified: data.isVerified,
                    updatedBy: data.updatedBy,
                    updatedAt: sql`NOW()`,
                })
                .where('publicId', '=', publicId)
                .returningAll()
                .executeTakeFirst()
        );
    }

    /**
     * Toggle manufacturer status
     */
    async toggleStatus(id: number, isActive: boolean, updatedBy?: string) {
        return executeQuery((db) =>
            db
                .updateTable('manufacturer')
                .set({
                    isActive: isActive,
                    updatedBy: updatedBy,
                    updatedAt: sql`NOW()`,
                })
                .where('id', '=', id)
                .returningAll()
                .executeTakeFirst()
        );
    }

    /**
     * Delete a manufacturer (soft delete if models exist, hard delete otherwise)
     */
    async delete(id: number): Promise<{ deleted: boolean; soft: boolean }> {
        return executeQuery(async (db) => {
            // Check if manufacturer has models
            const modelsCount = await db
                .selectFrom('model')
                .select((eb) => eb.fn.count('model.id').as('count'))
                .where('model.manufacturerId', '=', id)
                .executeTakeFirst();

            const hasModels = Number(modelsCount?.count || 0) > 0;

            if (hasModels) {
                // Soft delete: mark as inactive
                const result = await db
                    .updateTable('manufacturer')
                    .set({ isActive: false, updatedAt: sql`NOW()` })
                    .where('id', '=', id)
                    .executeTakeFirst();

                return { deleted: !!result, soft: true };
            } else {
                // Hard delete: remove from database
                const result = await db
                    .deleteFrom('manufacturer')
                    .where('id', '=', id)
                    .executeTakeFirst();

                return { deleted: !!result, soft: false };
            }
        });
    }

    /**
     * Delete a manufacturer by public ID
     */
    async deleteByPublicId(publicId: string): Promise<{ deleted: boolean; soft: boolean }> {
        return executeQuery(async (db) => {
            // First get the manufacturer ID
            const manufacturer = await db
                .selectFrom('manufacturer')
                .select('id')
                .where('publicId', '=', publicId)
                .executeTakeFirst();

            if (!manufacturer) {
                return { deleted: false, soft: false };
            }

            return this.delete(manufacturer.id);
        });
    }
}