import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
import env from '../env.js';
import { DB } from './schemas/index.js';

const { Pool } = pkg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: env.DB_HOST,
  port: 5432, // Default PostgreSQL port
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME
});

// Create a Kysely instance using the PostgreSQL dialect
export const dbConn = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
  log: (event) => {
    if (event.level === 'query') {
      console.log('SQL Query:', event.query.sql);
      console.log('Parameters:', event.query.parameters);
    }
  }
});

// Test database connection
export async function testConnection(): Promise<void> {
  await pool.query('SELECT 1');
}

// Example query function
export async function executeQuery<T>(
  queryFn: (db: Kysely<DB>) => Promise<T>
): Promise<T> {
  try {
    return await queryFn(dbConn);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Graceful shutdown function
export async function closeDatabase(): Promise<void> {
  await dbConn.destroy();
}

