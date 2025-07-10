import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

console.log({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'parts_app',
  port: parseInt(process.env.DB_PORT || '5432')
})

export default defineConfig({
  // Include all schema files in the migration generation
  schema: [
    './src/shared/database/schemas/core/drizzle-schema.ts',
    './src/shared/database/schemas/vendor/drizzle-schema.ts',
    './src/shared/database/schemas/customer/drizzle-schema.ts'
  ],
  
  // Single unified migrations directory
  out: './src/shared/database/migrations',
  
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'parts_app',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.NODE_ENV == 'development' ? false : true
  },
  verbose: true,
  strict: true,
})

