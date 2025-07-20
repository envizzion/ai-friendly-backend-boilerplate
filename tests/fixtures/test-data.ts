import { manufacturers } from '@core-db-schemas/drizzle-schema.js';
import { getTestDb } from '@tests/helpers/test-database.js';
import { manufacturerFactory } from './factories/manufacturer.factory.js';

// Seed manufacturers for testing
export async function seedManufacturers(count: number = 5) {
  const db = getTestDb();
  const data = Array.from({ length: count }, () => 
    manufacturerFactory.buildDbInsert()
  );
  
  return await db.insert(manufacturers).values(data).returning();
}

// Seed a specific manufacturer
export async function seedManufacturer(data?: any) {
  const db = getTestDb();
  const manufacturer = manufacturerFactory.buildDbInsert(data);
  
  const [result] = await db.insert(manufacturers).values(manufacturer).returning();
  return result;
}

// Clear all test data
export async function clearTestData() {
  const db = getTestDb();
  
  // Clear in correct order to respect foreign keys
  await db.delete(manufacturers).execute();
}