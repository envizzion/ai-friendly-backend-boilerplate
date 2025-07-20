import { faker } from '@faker-js/faker';
import { generateMock } from '@anatine/zod-mock';
import { 
  createManufacturerSchema,
  updateManufacturerSchema,
  type CreateManufacturerDto,
  type UpdateManufacturerDto,
  type ManufacturerResponse
} from '@/schemas/core/manufacturer.schemas';
import { generatePublicId } from '@/shared/utils/string';

export const manufacturerFactory = {
  // Build input for creating a manufacturer
  buildCreateInput: (overrides?: Partial<CreateManufacturerDto>): CreateManufacturerDto => {
    return {
      name: faker.company.name(),
      displayName: faker.company.name() + ' Inc.',
      logoImageId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
      countryCode: faker.location.countryCode('alpha-2').toUpperCase(),
      description: faker.company.catchPhrase(),
      isActive: true,
      isVerified: false,
      ...overrides,
    };
  },

  // Build input for updating a manufacturer
  buildUpdateInput: (overrides?: Partial<UpdateManufacturerDto>): UpdateManufacturerDto => {
    return {
      displayName: faker.company.name() + ' Corporation',
      logoImageId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
      countryCode: faker.location.countryCode('alpha-2').toUpperCase(),
      description: faker.company.catchPhrase(),
      isActive: faker.datatype.boolean(),
      isVerified: faker.datatype.boolean(),
      ...overrides,
    };
  },

  // Build a complete manufacturer response
  buildResponse: (overrides?: Partial<ManufacturerResponse>): ManufacturerResponse => {
    const name = overrides?.name || faker.company.name();
    return {
      id: generatePublicId(),
      name,
      displayName: overrides?.displayName || name + ' Inc.',
      slug: overrides?.slug || name.toLowerCase().replace(/\s+/g, '-'),
      logoImageId: faker.datatype.boolean() ? faker.string.uuid() : null,
      countryCode: faker.location.countryCode('alpha-2').toUpperCase(),
      description: faker.company.catchPhrase(),
      isActive: true,
      isVerified: false,
      modelCount: faker.number.int({ min: 0, max: 50 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  },

  // Build multiple manufacturers
  buildMany: (count: number, overrides?: Partial<ManufacturerResponse>): ManufacturerResponse[] => {
    return Array.from({ length: count }, (_, index) => 
      manufacturerFactory.buildResponse({
        name: `${faker.company.name()} ${index + 1}`,
        ...overrides,
      })
    );
  },

  // Build manufacturer for database insertion
  buildDbInsert: (overrides?: any) => {
    const name = overrides?.name || faker.company.name();
    return {
      publicId: generatePublicId(),
      name,
      displayName: overrides?.displayName || name + ' Inc.',
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      logoImagePublicId: faker.datatype.boolean() ? faker.string.uuid() : null,
      countryCode: faker.location.countryCode('alpha-2').toUpperCase(),
      description: faker.company.catchPhrase(),
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },
};