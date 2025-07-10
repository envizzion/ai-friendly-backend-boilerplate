import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
import env from '../env.js';
import { DB } from './schemas/index.js';
import { logger } from '@shared/logger.js';

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

export interface QueryContext {
    method: string;
    table?: string;
    operation?: string;
}

/**
 * Execute database query with logging and error handling
 */
export async function executeQuery<T>(
    operation: () => Promise<T>,
    context: QueryContext
): Promise<T> {
    const startTime = Date.now();
    
    try {
        const result = await operation();
        const duration = Date.now() - startTime;
        
        // Log slow queries (>1000ms)
        if (duration > 1000) {
            logger.info('Slow query detected', {
                method: context.method,
                table: context.table,
                operation: context.operation,
                duration: `${duration}ms`
            });
        }
        
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        
        // Enhanced error logging
        logger.error('Database query failed', {
            method: context.method,
            table: context.table,
            operation: context.operation,
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : String(error),
            errorCode: (error as any)?.code,
            errorConstraint: (error as any)?.constraint,
            stack: error instanceof Error ? error.stack : undefined
        });
        
        throw error;
    }
}

// Graceful shutdown function
export async function closeDatabase(): Promise<void> {
  await dbConn.destroy();
}

