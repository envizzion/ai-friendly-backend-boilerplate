import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schemas/customer/drizzle-schema';

// Create PostgreSQL client for customer database operations (same database, customer schema)
const customerClient = postgres(process.env.DATABASE_URL!);

// Create Drizzle database instance with customer schema
export const customerDb = drizzle(customerClient, { schema });

// Export type for type-safe database operations
export type CustomerDB = typeof customerDb;

// Export schema for external use
export { schema as customerSchema };