// Shared enum constants for drizzle schema and DTOs
export const FUEL_TYPES = ['ICE', 'Hybrid', 'PHEV', 'EV', 'FCEV', 'Other'] as const;
export const BODY_STYLE_CODES = ['Sedan', 'Hatchback', 'SUV', 'Wagon', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Minivan', 'Motorcycle', 'Scooter', 'ATV', 'UTV', 'Other'] as const;
export const MARKET_REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA', 'JP', 'CN', 'Global', 'Asia', 'Europe'] as const;
export const VEHICLE_STATUS = ['Active', 'Discontinued', 'Upcoming', 'Limited'] as const;
export const ASPIRATION_TYPES = ['Naturally Aspirated', 'Turbocharged', 'Supercharged'] as const;
export const FUEL_GRADES = ['Regular', 'Premium', 'Diesel', 'E85'] as const;
export const TRANSMISSION_TYPES = ['MT', 'AT', 'CVT', 'DCT'] as const;
export const CHARGING_STANDARDS = ['AC', 'DC', 'Tesla', 'CCS', 'CHAdeMO'] as const;

// Drivetrain types
export const DRIVETRAIN_TYPES = ['FWD', 'RWD', 'AWD', '4WD'] as const;

// Vehicle segments
export const VEHICLE_SEGMENTS = ['A', 'B', 'C', 'D', 'E', 'F', 'Motorcycle', 'Scooter', 'ATV', 'UTV', 'Commercial', 'Other'] as const;

// Trim levels
export const TRIM_LEVELS = ['Base', 'S', 'SE', 'SEL', 'Sport', 'Limited', 'Premium', 'Luxury', 'Performance', 'Touring', 'Other'] as const;

// Equipment levels
export const EQUIPMENT_LEVELS = ['Standard', 'Premium', 'Luxury', 'Sport', 'Performance', 'Other'] as const;

// Body style categories
export const BODY_STYLE_CATEGORIES = ['Car', 'Motorcycle', 'Truck', 'Commercial', 'Other'] as const;

// Audit actions
export const AUDIT_ACTIONS = ['INSERT', 'UPDATE', 'DELETE'] as const;

// Type unions for TypeScript
export type FuelType = typeof FUEL_TYPES[number];
export type BodyStyleCode = typeof BODY_STYLE_CODES[number];
export type MarketRegion = typeof MARKET_REGIONS[number];
export type VehicleStatus = typeof VEHICLE_STATUS[number];
export type AspirationType = typeof ASPIRATION_TYPES[number];
export type FuelGrade = typeof FUEL_GRADES[number];
export type TransmissionType = typeof TRANSMISSION_TYPES[number];
export type ChargingStandard = typeof CHARGING_STANDARDS[number];
export type DrivetrainType = typeof DRIVETRAIN_TYPES[number];
export type VehicleSegment = typeof VEHICLE_SEGMENTS[number];
export type TrimLevel = typeof TRIM_LEVELS[number];
export type EquipmentLevel = typeof EQUIPMENT_LEVELS[number];
export type BodyStyleCategory = typeof BODY_STYLE_CATEGORIES[number];
export type AuditAction = typeof AUDIT_ACTIONS[number];

// Runtime validation helpers
export const isValidFuelType = (value: string): value is FuelType =>
    FUEL_TYPES.includes(value as FuelType);

export const isValidBodyStyleCode = (value: string): value is BodyStyleCode =>
    BODY_STYLE_CODES.includes(value as BodyStyleCode);

export const isValidMarketRegion = (value: string): value is MarketRegion =>
    MARKET_REGIONS.includes(value as MarketRegion);

export const isValidVehicleStatus = (value: string): value is VehicleStatus =>
    VEHICLE_STATUS.includes(value as VehicleStatus);

export const isValidTransmissionType = (value: string): value is TransmissionType =>
    TRANSMISSION_TYPES.includes(value as TransmissionType);

export const isValidDrivetrainType = (value: string): value is DrivetrainType =>
    DRIVETRAIN_TYPES.includes(value as DrivetrainType);

export const isValidTrimLevel = (value: string): value is TrimLevel =>
    TRIM_LEVELS.includes(value as TrimLevel);

export const isValidEquipmentLevel = (value: string): value is EquipmentLevel =>
    EQUIPMENT_LEVELS.includes(value as EquipmentLevel);

