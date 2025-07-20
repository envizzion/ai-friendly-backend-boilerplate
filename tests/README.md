# Testing Guide

## Overview

This directory contains all tests for the Parts Backend New project. We use Vitest as our test runner with a focus on fast, reliable tests organized by domain.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# View coverage report
pnpm test:coverage

# Open Vitest UI
pnpm test:ui
```

## Test Structure

```
tests/
├── unit/                     # Fast, isolated unit tests
│   └── features/            # Mirrors src/features structure
│       ├── core/
│       ├── vendor/
│       ├── customer/
│       └── common/
├── integration/             # Tests with real dependencies
│   └── api/                # API endpoint tests
│       ├── core/
│       ├── vendor/
│       ├── customer/
│       └── common/
├── fixtures/               # Test data and factories
│   ├── factories/         # Data factories
│   └── test-data.ts      # Database seeding utilities
└── helpers/               # Test utilities
    ├── test-database.ts  # Database setup/teardown
    └── test-server.ts    # Test app instance
```

## Writing Tests

### Unit Tests

Unit tests should be fast and isolated. Mock all external dependencies.

```typescript
// Example: manufacturer.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ManufacturerService } from '@/features/core/manufacturer/manufacturer.service';

describe('ManufacturerService', () => {
  it('should create a manufacturer', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Integration tests use real databases via testcontainers.

```typescript
// Example: manufacturer.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase } from '@tests/helpers/test-database';

describe('Manufacturer API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should create a manufacturer', async () => {
    // Test implementation
  });
});
```

## Test Data

Use factories to generate consistent test data:

```typescript
import { manufacturerFactory } from '@tests/fixtures/factories/manufacturer.factory';

// Create a single manufacturer
const manufacturer = manufacturerFactory.buildCreateInput();

// Create with overrides
const customManufacturer = manufacturerFactory.buildCreateInput({
  name: 'Tesla',
  countryCode: 'US',
});

// Create multiple
const manufacturers = manufacturerFactory.buildMany(5);
```

## Database Testing

Integration tests use PostgreSQL via testcontainers:

1. Tests automatically start a PostgreSQL container
2. Migrations run automatically
3. Each test can have isolated data
4. Containers are cleaned up after tests

## Best Practices

1. **Keep tests fast** - Unit tests should complete in milliseconds
2. **Test behavior, not implementation** - Focus on what, not how
3. **Use descriptive test names** - Should explain what is being tested
4. **One assertion per test** - Makes failures clear
5. **Use factories** - Consistent, maintainable test data
6. **Clean up after tests** - No side effects between tests

## Debugging Tests

```bash
# Run a specific test file
pnpm test tests/unit/features/core/manufacturer/manufacturer.service.test.ts

# Run tests matching a pattern
pnpm test -t "should create"

# Debug in VS Code
# Add breakpoints and use the "Debug" lens above test functions
```

## Coverage

We aim for:
- 80% overall coverage
- 85% coverage for business logic (services)
- 90% coverage for critical paths

View coverage reports:
```bash
pnpm test:coverage
# Open coverage/index.html in browser
```

## Troubleshooting

### Tests are slow
- Check if you're running integration tests that need Docker
- Ensure mocks are being used in unit tests
- Look for unnecessary async operations

### Database connection errors
- Ensure Docker is running
- Check if ports 5432 are available
- Verify DATABASE_URL in .env.test

### Type errors
- Run `pnpm build` to check for TypeScript issues
- Ensure all dependencies are installed
- Check that paths in tsconfig.json are correct