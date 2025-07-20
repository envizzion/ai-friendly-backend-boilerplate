import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'src/index.ts',
        'src/server.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
      '@shared': resolve(__dirname, './src/shared'),
      '@config': resolve(__dirname, './src/config'),
      '@features': resolve(__dirname, './src/features'),
      '@core': resolve(__dirname, './src/features/core'),
      '@customer': resolve(__dirname, './src/features/customer'),
      '@vendor': resolve(__dirname, './src/features/vendor'),
      '@common': resolve(__dirname, './src/features/common'),
      '@database': resolve(__dirname, './src/shared/database'),
      '@db-schemas': resolve(__dirname, './src/shared/database/schemas'),
      '@core-db-schemas': resolve(__dirname, './src/shared/database/schemas/core'),
      '@customer-db-schemas': resolve(__dirname, './src/shared/database/schemas/customer'),
      '@vendor-db-schemas': resolve(__dirname, './src/shared/database/schemas/vendor'),
      '@cloud': resolve(__dirname, './src/shared/cloud'),
      '@utils': resolve(__dirname, './src/shared/utils'),
      '@types': resolve(__dirname, './src/shared/types'),
      '@schemas': resolve(__dirname, './src/shared/database/schemas'),
      '@core-schemas': resolve(__dirname, './src/shared/database/schemas/core'),
      '@customer-schemas': resolve(__dirname, './src/shared/database/schemas/customer'),
      '@vendor-schemas': resolve(__dirname, './src/shared/database/schemas/vendor'),
    },
  },
});