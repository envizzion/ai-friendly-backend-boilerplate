# Database Migrations with Kysely

This directory contains the database schema and migration tools for the motorcycle parts application using Kysely.

## Directory Structure

- `database.ts` - Database connection setup
- `migrator.ts` - Migration runner script
- `create-migration.ts` - Script to create new migration files
- `migrations/` - Directory containing migration files
- `schema/` - Directory containing database schema definitions

## Migration Commands

The following npm scripts are available for database migrations:

```bash
# Create a new migration file
pnpm db:create-migration <migration-name>

# Run all pending migrations
pnpm db:migrate

# Rollback the latest migration
pnpm db:rollback

# List all migrations and their status
pnpm db:list
```

## Creating a New Migration

To create a new migration, run:

```bash
pnpm db:create-migration add-new-feature
```

This will create a new migration file in the `migrations` directory with a timestamp prefix.

## Migration File Structure

Each migration file has an `up` function for applying the migration and a `down` function for rolling it back:

```typescript
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Write your migration code here
  await db.schema
    .createTable('example')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Write code to revert the migration here
  await db.schema.dropTable('example').execute();
}
```

## Database Schema

The database schema is defined in `schema/schema.ts` using TypeScript interfaces. This provides type safety when querying the database with Kysely.

## Repository Pattern

The application uses the repository pattern for database access. Repository classes are located in the `src/repository` directory and provide methods for CRUD operations on specific entities. 