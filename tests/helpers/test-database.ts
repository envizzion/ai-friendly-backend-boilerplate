import * as coreSchema from '@/shared/database/schemas/core/drizzle-schema';
import { randomBytes } from 'crypto';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

let sql: postgres.Sql | null = null;
let db: PostgresJsDatabase<typeof coreSchema> | null = null;
let adminSql: postgres.Sql | null = null;
let testDbName: string | null = null;

// Default connection string for local PostgreSQL
const DEFAULT_PG_URL = process.env.TEST_DATABASE_URL || 'postgres://root:password@localhost/parts-db-new';

export async function setupTestDatabase() {
  // Generate unique database name for this test run
  testDbName = `test_${randomBytes(8).toString('hex')}`;

  // Connect to admin database to create test database
  adminSql = postgres(DEFAULT_PG_URL, { max: 1 });

  try {
    // Create test database
    await adminSql.unsafe(`CREATE DATABASE "${testDbName}"`);

    // Connect to the new test database
    const testUrl = DEFAULT_PG_URL.replace(/\/[^/]*$/, `/${testDbName}`);
    sql = postgres(testUrl, { max: 1 });
    db = drizzle(sql, { schema: coreSchema });

    // Run migrations
    await migrate(db, { migrationsFolder: './src/shared/database/migrations' });

    return { db, sql, connectionString: testUrl };
  } catch (error) {
    console.error('Failed to setup test database:', error);
    if (adminSql) await adminSql.end();
    throw error;
  }
}

export async function cleanupTestDatabase() {
  try {
    if (sql) {
      await sql.end();
    }

    if (adminSql && testDbName) {
      // Drop test database
      await adminSql.unsafe(`DROP DATABASE IF EXISTS "${testDbName}"`);
      await adminSql.end();
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  } finally {
    sql = null;
    db = null;
    adminSql = null;
    testDbName = null;
  }
}

export function getTestDb() {
  if (!db) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return db;
}

export function getTestSql() {
  if (!sql) {
    throw new Error('Test SQL client not initialized. Call setupTestDatabase() first.');
  }
  return sql;
}

// Helper to clean all tables
export async function cleanAllTables() {
  const db = getTestDb();

  // Delete in correct order to respect foreign keys
  await db.delete(coreSchema.modelVariations).execute();
  await db.delete(coreSchema.models).execute();
  await db.delete(coreSchema.manufacturers).execute();
  await db.delete(coreSchema.files).execute();
  await db.delete(coreSchema.users).execute();
}

// Transaction helper for tests
export async function withTransaction<T>(
  callback: (tx: PostgresJsDatabase<typeof coreSchema>) => Promise<T>
): Promise<T> {
  const db = getTestDb();
  return db.transaction(async (tx) => {
    try {
      return await callback(tx);
    } finally {
      // Transaction will be rolled back automatically in tests
      throw new Error('Rollback test transaction');
    }
  }).catch((error) => {
    if (error.message === 'Rollback test transaction') {
      // This is expected, return undefined
      return undefined as T;
    }
    throw error;
  });
}