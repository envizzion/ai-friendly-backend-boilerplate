# Testing Setup Guide

## Prerequisites

For integration tests to work, you need the existing PostgreSQL container running.

### Your Current Setup

The tests use your existing PostgreSQL container with these credentials:
- Host: localhost
- Port: 5432 (default)
- User: root
- Password: password
- Database: parts-db-new

Make sure your PostgreSQL container is running before running integration tests.

## Environment Configuration

The tests use the connection string from `TEST_DATABASE_URL` environment variable.

Default: `postgres://root:password@localhost/parts-db-new`

You can override this in `.env.test`:
```env
TEST_DATABASE_URL=postgresql://your_user:your_pass@localhost:5432/your_db
```

## How It Works

1. **Test Database Creation**: Each test suite creates a unique database (e.g., `test_a1b2c3d4`)
2. **Migrations**: Drizzle migrations run automatically on the test database
3. **Isolation**: Each test file gets its own database instance
4. **Cleanup**: Test databases are automatically dropped after tests complete

## Running Tests

```bash
# Unit tests (no database required)
pnpm test:unit

# Integration tests (requires PostgreSQL)
pnpm test:integration

# All tests
pnpm test

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Troubleshooting

### "Connection refused" errors
- Ensure PostgreSQL is running on port 5432
- Check the connection string in `.env.test`
- Verify the user has CREATEDB privileges

### "Database already exists" errors
- This shouldn't happen as we use random database names
- If it does, restart the test or check for orphaned test databases

### Slow tests
- Database creation should be fast (~100-500ms)
- If tests are slow, check your PostgreSQL configuration
- Consider using a local SSD for the PostgreSQL data directory

### Cleanup orphaned test databases
```bash
# Connect to PostgreSQL and run:
# DROP DATABASE IF EXISTS test_<random_id>;
# Or use a script to clean all test databases:
psql -U postgres -c "SELECT 'DROP DATABASE IF EXISTS ' || datname || ';' FROM pg_database WHERE datname LIKE 'test_%';"
```