# VS Code Setup for Path Aliases

## Issue
VS Code shows import errors for path aliases like `@/features/core/...` in test files, even though tests run correctly.

## Solution

### 1. TypeScript Configuration
The `tsconfig.json` has been updated to include the tests directory:

```json
{
  "include": [
    "src/**/*",
    "tests/**/*"  // ← Added this
  ]
}
```

### 2. VS Code Settings
Created `.vscode/settings.json` with TypeScript-specific settings.

### 3. Restart TypeScript Language Server

In VS Code:
1. Open Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type "TypeScript: Restart TS Server"
3. Select it and press Enter

### 4. Alternative: Reload VS Code Window

1. Open Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Developer: Reload Window"
3. Select it and press Enter

## Verification

After restarting the TypeScript server, imports like these should work without errors:

```typescript
import { ManufacturerController } from '@/features/core/manufacturer/manufacturer.controller';
import { setupTestDatabase } from '@tests/helpers/test-database';
```

## Available Path Aliases

### Source Code Aliases
- `@/*` → `src/*`
- `@shared/*` → `src/shared/*`
- `@features/*` → `src/features/*`
- `@core/*` → `src/features/core/*`
- `@customer/*` → `src/features/customer/*`
- `@vendor/*` → `src/features/vendor/*`
- `@common/*` → `src/features/common/*`
- `@database/*` → `src/shared/database/*`
- `@utils/*` → `src/shared/utils/*`
- `@types/*` → `src/shared/types/*`

### Test Aliases
- `@tests/*` → `tests/*`

## Still Having Issues?

1. **Check file extensions**: Make sure to use `.js` extensions in imports for ES modules
2. **Verify tsconfig.json**: Ensure `"moduleResolution": "NodeNext"` is set
3. **Check workspace**: Make sure you're opening the project root folder in VS Code
4. **TypeScript version**: Ensure you're using workspace TypeScript version (bottom right of VS Code)

## Example Working Import

```typescript
// tests/integration/api/core/manufacturer.test.ts
import { testApp } from '@tests/helpers/test-server';
import { setupTestDatabase } from '@tests/helpers/test-database';
import { ManufacturerController } from '@/features/core/manufacturer/manufacturer.controller';
```