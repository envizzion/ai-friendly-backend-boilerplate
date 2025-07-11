import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@core-schemas/drizzle-schema.js';

// Create PostgreSQL client for core database operations
const coreClient = postgres(process.env.DATABASE_URL!);

// Create Drizzle database instance with core schema
export const coreDb = drizzle(coreClient, { schema });

// Export type for type-safe database operations
export type CoreDB = typeof coreDb;

// Export schema for external use
export { schema as coreSchema };