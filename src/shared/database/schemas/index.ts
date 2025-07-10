/**
 * Unified Database Interface
 * 
 * This file combines all section-specific Kysely types into a single DB interface
 * for cross-section queries and operations.
 */

// Import section-specific DB interfaces
import type { DB as CoreDB } from '@core-schemas/kysely-types.js';
import type { DB as CustomerDB } from '@customer-schemas/kysely-types.js';
import type { DB as VendorDB } from '@vendor-schemas/kysely-types.js';

// Re-export individual section interfaces
export type { DB as CoreDB } from '@core-schemas/kysely-types.js';
export type { DB as CustomerDB } from '@customer-schemas/kysely-types.js';
export type { DB as VendorDB } from '@vendor-schemas/kysely-types.js';

// Re-export common types from core section
export type {
  BodyStyle, CategoryPart, Color, Coordinates, File, Int8, Manufacturer,
  Model, ModelVariation, ModelVariationCategory,
  ModelVariationToCategory,
  Part, PartAlternative, PartCategory, PartName, PartTag, Tag, Timestamp, User, VehicleHierarchyAudit, VinPrefix
} from './core/kysely-types.js';

// ============================================
// UNIFIED DATABASE INTERFACE
// ============================================

/**
 * Combined database interface for cross-section operations
 * 
 * This interface includes all tables from all sections and can be used
 * when you need to query across multiple sections in a single operation.
 * 
 * For section-specific operations, prefer using the individual section
 * interfaces (CoreDB, VendorDB, CustomerDB) for better type safety.
 */
export interface DB extends CoreDB, VendorDB, CustomerDB {
  // This interface automatically combines all section tables
  // Core tables: user, manufacturer, model, part, file, etc.
  // Vendor tables: vendorProfile, vendorInventory, vendorOrder, etc. (when generated)
  // Customer tables: customerProfile, shoppingCart, customerOrder, etc. (when generated)
}

// ============================================
// DATABASE SECTION HELPERS
// ============================================

/**
 * Helper type to extract section-specific table names
 */
export type CoreTableNames = keyof CoreDB;
export type VendorTableNames = keyof VendorDB;
export type CustomerTableNames = keyof CustomerDB;
export type AllTableNames = keyof DB;

/**
 * Helper to check if a table belongs to a specific section
 */
export const isCoreTable = (tableName: string): tableName is CoreTableNames => {
  const coreTables: CoreTableNames[] = [
    'user', 'manufacturer', 'model', 'bodyStyle', 'color', 'modelVariation',
    'vinPrefix', 'vehicleHierarchyAudit', 'file', 'partName', 'partCategory',
    'modelVariationCategory', 'modelVariationToCategory', 'part', 'categoryPart',
    'partAlternative', 'tag', 'partTag'
  ];
  return coreTables.includes(tableName as CoreTableNames);
};

export const isVendorTable = (tableName: string): tableName is VendorTableNames => {
  // Will be populated when vendor types are generated
  return tableName.startsWith('vendor');
};

export const isCustomerTable = (tableName: string): tableName is CustomerTableNames => {
  // Will be populated when customer types are generated
  return tableName.startsWith('customer') || tableName.startsWith('shopping');
};