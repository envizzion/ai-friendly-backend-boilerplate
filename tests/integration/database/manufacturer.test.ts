import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, cleanAllTables, getTestDb } from '@tests/helpers/test-database.js';
import { manufacturerFactory } from '@tests/fixtures/factories/manufacturer.factory.js';
import { manufacturers } from '@core-db-schemas/drizzle-schema.js';
import { eq } from 'drizzle-orm';

describe('Manufacturer Database Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 10000); // 10 second timeout for database setup

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await cleanAllTables();
  });

  describe('Database Operations', () => {
    it('should insert and retrieve a manufacturer', async () => {
      const db = getTestDb();
      const manufacturerData = manufacturerFactory.buildDbInsert({
        name: 'Test Manufacturer',
        displayName: 'Test Manufacturer Inc.'
      });

      // Insert manufacturer
      const [inserted] = await db.insert(manufacturers).values(manufacturerData).returning();
      
      expect(inserted).toBeDefined();
      expect(inserted.name).toBe('Test Manufacturer');
      expect(inserted.displayName).toBe('Test Manufacturer Inc.');
      expect(inserted.publicId).toBeTruthy();

      // Retrieve manufacturer
      const found = await db.select().from(manufacturers).where(eq(manufacturers.id, inserted.id));
      
      expect(found).toHaveLength(1);
      expect(found[0].name).toBe('Test Manufacturer');
    });

    it('should handle multiple manufacturers', async () => {
      const db = getTestDb();
      const manufacturerData = [
        manufacturerFactory.buildDbInsert({ name: 'Manufacturer A' }),
        manufacturerFactory.buildDbInsert({ name: 'Manufacturer B' }),
        manufacturerFactory.buildDbInsert({ name: 'Manufacturer C' }),
      ];

      // Insert multiple manufacturers
      const inserted = await db.insert(manufacturers).values(manufacturerData).returning();
      
      expect(inserted).toHaveLength(3);
      
      // Query all manufacturers
      const all = await db.select().from(manufacturers);
      expect(all).toHaveLength(3);

      const names = all.map(m => m.name).sort();
      expect(names).toEqual(['Manufacturer A', 'Manufacturer B', 'Manufacturer C']);
    });
  });
});