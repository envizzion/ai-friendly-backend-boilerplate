import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schemas/vendor/drizzle-schema';

// Create PostgreSQL client for vendor database operations (same database, vendor schema)
const vendorClient = postgres(process.env.DATABASE_URL!);

// Create Drizzle database instance with vendor schema
export const vendorDb = drizzle(vendorClient, { schema });

// Export type for type-safe database operations
export type VendorDB = typeof vendorDb;

// Export schema for external use
export { schema as vendorSchema };