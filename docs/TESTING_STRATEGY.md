# Testing Strategy for Parts Backend New

## 🎯 Overview

This document outlines the comprehensive testing strategy for the Parts Backend New project, designed to align with our domain-based architecture while providing excellent coverage, maintainability, and developer experience.

## 📊 Testing Philosophy

- **Test Pyramid**: 70% unit tests, 25% integration tests, 5% E2E tests
- **Fast Feedback**: Unit tests complete in < 10 seconds
- **Domain Isolation**: Tests organized by business domains (core, vendor, customer, common)
- **Type Safety**: Leverage Zod schemas for test data generation and validation
- **Developer-Friendly**: Clear patterns for test writing and maintenance

## 🛠️ Technology Stack

### Primary Test Runner: **Vitest**
- **Why**: Native ESM support, TypeScript-first, extremely fast, excellent DX
- **Benefits**: Snapshot testing, parallel execution, watch mode, built-in coverage
- **Configuration**: Zero-config TypeScript support

### API Testing: **Hono Test Client + Vitest**
- **Hono test()**: Built-in test client for Hono applications
- **Why**: Native Hono support, type-safe request/response testing
- **Benefits**: No need for supertest, seamless integration

### Database Testing: **Existing PostgreSQL Container**
- **Your setup**: Uses existing PostgreSQL container with temporary test databases
- **Why**: Fast setup, real database behavior, supports Drizzle + Kysely stack
- **Alternative for unit tests**: Mock repositories with vitest

### Mocking & Test Data
- **@faker-js/faker**: Generate realistic test data
- **zod-mock**: Auto-generate test data from Zod schemas
- **vitest**: Built-in mocking capabilities

## 📁 Test Structure Organization

```
tests/
├── unit/                          # Fast, isolated tests
│   ├── features/                  # Mirrors feature structure
│   │   ├── core/
│   │   │   └── manufacturer/
│   │   │       ├── manufacturer.service.test.ts
│   │   │       ├── manufacturer.repository.test.ts
│   │   │       └── manufacturer.controller.test.ts
│   │   ├── vendor/
│   │   ├── customer/
│   │   └── common/
│   └── shared/                    # Test shared utilities
│       ├── database/
│       ├── auth/
│       └── cloud/
│
├── integration/                   # Tests with real dependencies
│   ├── api/                       # API endpoint testing
│   │   ├── core/
│   │   │   └── manufacturer.test.ts
│   │   ├── vendor/
│   │   ├── customer/
│   │   └── common/
│   └── database/                  # Database integration tests
│       └── repositories/
│
├── fixtures/                      # Shared test data
│   ├── factories/                 # Type-safe data factories
│   │   ├── manufacturer.factory.ts
│   │   └── base.factory.ts
│   └── seeds/                     # Database seed data
│       └── test-data.ts
│
└── helpers/                       # Test utilities
    ├── test-database.ts           # Test database setup
    ├── test-server.ts             # Test server setup
    └── test-utils.ts              # Common test utilities
```

## 🧪 Testing Patterns

### Unit Test Pattern

```typescript
// manufacturer.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManufacturerService } from '@/features/core/manufacturer/manufacturer.service';
import { createManufacturerFactory } from '@/tests/fixtures/factories/manufacturer.factory';

describe('ManufacturerService', () => {
  let service: ManufacturerService;
  let mockRepository: MockManufacturerRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new ManufacturerService(mockRepository);
  });

  describe('createManufacturer', () => {
    it('should create a manufacturer with valid data', async () => {
      const input = createManufacturerFactory.build();
      const expected = { ...input, id: 'uuid', createdAt: new Date() };
      
      mockRepository.create.mockResolvedValue(expected);
      
      const result = await service.createManufacturer(input);
      
      expect(result).toEqual(expected);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it('should throw error for duplicate manufacturer name', async () => {
      const input = createManufacturerFactory.build();
      mockRepository.findByName.mockResolvedValue(existingManufacturer);
      
      await expect(service.createManufacturer(input))
        .rejects.toThrow('Manufacturer with name already exists');
    });
  });
});
```

### Integration Test Pattern

```typescript
// api/core/manufacturer.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testApp } from '@/tests/helpers/test-server';
import { setupTestDatabase, cleanupTestDatabase } from '@/tests/helpers/test-database';
import { manufacturerFactory } from '@/tests/fixtures/factories/manufacturer.factory';

describe('Manufacturer API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/core/manufacturers', () => {
    it('should create a new manufacturer', async () => {
      const input = manufacturerFactory.build();
      
      const response = await testApp.request('/api/core/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toMatchObject({
        name: input.name,
        displayName: input.displayName,
      });
    });
  });

  describe('GET /api/core/manufacturers', () => {
    it('should list manufacturers with pagination', async () => {
      // Seed test data
      await seedManufacturers(5);
      
      const response = await testApp.request('/api/core/manufacturers?page=1&limit=10');
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(5);
      expect(data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 5,
      });
    });
  });
});
```

## 📊 Test Data Strategy

### Factory Pattern with Zod Integration

```typescript
// fixtures/factories/manufacturer.factory.ts
import { faker } from '@faker-js/faker';
import { generateMock } from '@anatine/zod-mock';
import { 
  createManufacturerSchema,
  type CreateManufacturerDto 
} from '@/schemas/core/manufacturer.schemas';

export const manufacturerFactory = {
  build: (overrides?: Partial<CreateManufacturerDto>): CreateManufacturerDto => {
    const generated = generateMock(createManufacturerSchema);
    
    return {
      ...generated,
      name: faker.company.name(),
      displayName: faker.company.name(),
      countryCode: faker.location.countryCode('alpha-2'),
      description: faker.company.catchPhrase(),
      ...overrides,
    };
  },
  
  buildMany: (count: number, overrides?: Partial<CreateManufacturerDto>) => {
    return Array.from({ length: count }, () => manufacturerFactory.build(overrides));
  }
};
```

## 🚀 Implementation Guide

### 1. Prerequisites

**PostgreSQL Setup**: Your existing PostgreSQL container must be running:
- Host: localhost
- Port: 5432 (default)
- User: root
- Password: password
- Database: parts-db-new

### 2. Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 3. Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### 4. Test Helpers

```typescript
// tests/helpers/test-database.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as coreSchema from '@/shared/database/schemas/core/drizzle-schema';
import { randomBytes } from 'crypto';

// Uses your existing PostgreSQL container
const DEFAULT_PG_URL = process.env.TEST_DATABASE_URL || 'postgres://root:password@localhost/parts-db-new';

export async function setupTestDatabase() {
  // Generate unique database name for this test run
  const testDbName = `test_${randomBytes(8).toString('hex')}`;
  
  // Connect to admin database to create test database
  const adminSql = postgres(DEFAULT_PG_URL, { max: 1 });
  await adminSql.unsafe(`CREATE DATABASE "${testDbName}"`);
  
  // Connect to the new test database
  const testUrl = DEFAULT_PG_URL.replace(/\/[^/]*$/, `/${testDbName}`);
  const sql = postgres(testUrl, { max: 1 });
  const db = drizzle(sql, { schema: coreSchema });

  // Run migrations
  await migrate(db, { migrationsFolder: './src/shared/database/migrations' });

  return { db, sql, connectionString: testUrl };
}

export async function cleanupTestDatabase() {
  // Database is automatically dropped after tests
  if (sql) await sql.end();
  if (adminSql && testDbName) {
    await adminSql.unsafe(`DROP DATABASE IF EXISTS "${testDbName}"`);
    await adminSql.end();
  }
}
```

## 📋 Testing Checklist

### For New Features
- [ ] Unit tests for service layer
- [ ] Unit tests for repository layer  
- [ ] Unit tests for controller layer
- [ ] Integration tests for API endpoints
- [ ] Test data factories created
- [ ] Error scenarios covered
- [ ] Edge cases tested

### For Bug Fixes
- [ ] Regression test added
- [ ] Root cause tested
- [ ] Related functionality tested
- [ ] Integration test if needed

## 🎯 Coverage Goals

### Overall Targets
- **Total Coverage**: 80%
- **Critical Paths**: 90%
- **New Code**: 85%

### By Layer
- **Services**: 85% (business logic)
- **Controllers**: 80% (request handling)
- **Repositories**: 75% (data access)
- **Utilities**: 90% (pure functions)

## 🚨 Best Practices

### Do's
- Write tests first (TDD when possible)
- Keep tests focused and isolated
- Use descriptive test names
- Test behavior, not implementation
- Mock external dependencies
- Use factories for test data

### Don'ts
- Don't test framework code
- Don't share state between tests
- Don't use production database
- Don't skip error scenarios
- Don't over-mock
- Don't write brittle tests

## 🔄 Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
    steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
        
    - run: pnpm install
    - run: pnpm test:unit
    - run: pnpm test:integration
    - run: pnpm test:coverage
    
    - uses: codecov/codecov-action@v3
      if: always()
```

## 🎉 Getting Started

1. **Ensure PostgreSQL is running**:
   ```bash
   # Your existing PostgreSQL container should be running on localhost:5432
   # with user: root, password: password, database: parts-db-new
   ```

2. **Install dependencies** (already done):
   ```bash
   pnpm add -D vitest @vitest/ui @vitest/coverage-v8
   pnpm add -D @faker-js/faker @anatine/zod-mock
   ```

3. **Run tests**:
   ```bash
   # Unit tests (fast, no database required)
   pnpm test:unit
   
   # Database integration tests (requires PostgreSQL)
   pnpm test tests/integration/database/
   
   # Watch mode for development
   pnpm test:watch
   ```

4. **Check coverage**:
   ```bash
   pnpm test:coverage
   ```

## 🔧 VS Code Setup

If you see import errors for path aliases like `@/features/...` in test files:

1. **Restart TypeScript Server**: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. **Or reload window**: `Cmd+Shift+P` → "Developer: Reload Window"

See `VSCODE_SETUP.md` for detailed troubleshooting.

---

This testing strategy provides a solid foundation for maintaining high-quality code while supporting rapid development in our domain-based architecture.