import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as coreSchema from '@/shared/database/schemas/core/drizzle-schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

let container: StartedPostgreSqlContainer | null = null;
let sql: postgres.Sql | null = null;
let db: PostgresJsDatabase<typeof coreSchema> | null = null;

export async function setupTestDatabase() {
  // Start PostgreSQL container
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_pass')
    .withExposedPorts(5432)
    .start();

  const connectionString = container.getConnectionUri();
  sql = postgres(connectionString, { max: 1 });
  db = drizzle(sql, { schema: coreSchema });

  // Run migrations
  await migrate(db, { migrationsFolder: './src/shared/database/migrations' });

  return { db, sql, connectionString };
}

export async function cleanupTestDatabase() {
  if (sql) {
    await sql.end();
  }
  if (container) {
    await container.stop();
  }
  sql = null;
  db = null;
  container = null;
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