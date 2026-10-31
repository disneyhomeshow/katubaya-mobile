/**
 * katubaya Domain Contracts
 * Source of truth for all data types
 * Schema Version: 1.1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

export type CropCategoryType = 
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'herbs'
  | 'nuts'
  | 'roots'
  | 'animal'
  | 'custom';

export type UnitType = 
  | 'kg'
  | 'g'
  | 'unit'
  | 'bunch'
  | 'liter'
  | 'ml'
  | 'box'
  | 'bag'
  | 'dozen';

export type AdjustmentReason = 
  | 'sold'
  | 'consumed'
  | 'damage'
  | 'loss'
  | 'gift'
  | 'correction'
  | 'processing';

export type ExpirationStatus = 'fresh' | 'expiring_soon' | 'expired';

export type Species = 'cattle' | 'poultry' | 'swine' | 'goat' | 'sheep' | 'bees' | 'fish' | 'other';

export type AnimalAdjustmentReason =
  | 'birth'
  | 'purchase'
  | 'death'
  | 'sale'
  | 'slaughter'
  | 'correction';

// ============================================================================
// BASE ENTITY
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ============================================================================
// CROP/CULTURE REGISTRY
// ============================================================================

export interface CropCategory extends BaseEntity {
  name: string;
  type: CropCategoryType;
  icon?: string;
  color?: string;
  sortOrder: number;
}

export interface Crop extends BaseEntity {
  categoryId: string;
  name: string;
  defaultUnit: UnitType;
  shelfLifeDaysDefault: number;
  pricePerUnit?: number; // Price per unit in local currency
  guildTags?: string[];
  notes?: string;
  isFavorite: boolean;
  lastUsedAt?: string;
}

export interface Cultivar extends BaseEntity {
  cropId: string;
  name: string;
  shelfLifeDaysOverride?: number;
  notes?: string;
}

// ============================================================================
// ZONES (Optional)
// ============================================================================

export interface Zone extends BaseEntity {
  name: string;
  description?: string;
  sortOrder: number;
}

// ============================================================================
// HARVEST & LOTS
// ============================================================================

export interface HarvestEvent extends BaseEntity {
  cropId: string;
  cultivarId?: string;
  zoneId?: string;
  quantity: number;
  unit: UnitType;
  harvestedAt: string; // ISO 8601
  notes?: string;
  lotId: string; // Reference to created lot
  animalGroupId?: string; // Milking, egg collection, slaughter: which animal lot produced it
}

export interface Lot extends BaseEntity {
  cropId: string;
  cultivarId?: string;
  zoneId?: string;
  harvestEventId: string;
  initialQuantity: number;
  quantityRemaining: number;
  unit: UnitType;
  harvestedAt: string;
  expiresAtEstimate: string; // ISO 8601
  notes?: string;
}

// ============================================================================
// INVENTORY
// ============================================================================

export interface InventoryAdjustment extends BaseEntity {
  lotId: string;
  cropId: string;
  quantityDelta: number; // negative for reductions
  unit: UnitType;
  reason: AdjustmentReason;
  notes?: string;
  adjustedAt: string;
  harvestEventId?: string; // reason 'processing': the production this lot was turned into
}

// ============================================================================
// ANIMALS ("lote de animais": a group managed together)
// ============================================================================

export interface AnimalGroup extends BaseEntity {
  name: string;
  species: Species;
  initialHeadcount: number;
  headcount: number; // current heads; 0 = closed lot
  zoneId?: string;
  startedAt: string;
  notes?: string;
}

export interface AnimalAdjustment extends BaseEntity {
  groupId: string;
  delta: number; // negative for exits
  reason: AnimalAdjustmentReason;
  notes?: string;
  harvestEventId?: string; // slaughter: the meat harvest it produced
  adjustedAt: string;
}

export interface InventorySnapshot {
  generatedAt: string;
  items: InventorySnapshotItem[];
}

export interface InventorySnapshotItem {
  cropId: string;
  cropName: string;
  cultivarId?: string;
  cultivarName?: string;
  totalQuantity: number;
  unit: UnitType;
  pricePerUnit?: number;
  totalValue?: number;
  lots: LotSummary[];
  expirationStatus: ExpirationStatus;
  earliestExpiry?: string;
}

export interface LotSummary {
  lotId: string;
  quantityRemaining: number;
  expiresAtEstimate: string;
  expirationStatus: ExpirationStatus;
  daysUntilExpiry: number;
}

// ============================================================================
// AVAILABILITY
// ============================================================================

export interface AvailabilityWindow {
  id: string;
  name: string; // e.g., "Esta semana", "Próxima semana"
  startDate: string;
  endDate: string;
}

export interface AvailabilityItem {
  id: string;
  cropId: string;
  cropName: string;
  cultivarId?: string;
  cultivarName?: string;
  quantity: number;
  unit: UnitType;
  pricePerUnit?: number;
  windowId?: string;
  isIncluded: boolean; // Can be toggled off
  sortOrder: number;
}

export interface AvailabilityList extends BaseEntity {
  windowId?: string;
  windowName?: string;
  items: AvailabilityItem[];
  headerText?: string;
  footerText?: string;
  contactInfo?: string;
  farmName?: string;
  generatedMessage?: string;
  isStale: boolean;
  inventorySnapshotAt: string;
}

export interface AvailabilityConfig {
  id: string;
  farmName: string;
  contactInfo: string;
  defaultHeaderText: string;
  defaultFooterText: string;
  defaultWindowDays: number;
  updatedAt: string;
}

// ============================================================================
// EXPORT PACK
// ============================================================================

export interface ExportManifest {
  schemaVersion: string;
  appVersion: string;
  exportedAt: string;
  packId: string;
  packType: 'availability' | 'full_history';
  deviceId?: string;
  farmName?: string;
}

export interface AvailabilityPack {
  manifest: ExportManifest;
  availabilityList: AvailabilityList;
  inventorySnapshot: InventorySnapshot;
  crops: Crop[];
  cultivars: Cultivar[];
  categories: CropCategory[];
}

// ============================================================================
// APP STATE
// ============================================================================

export interface AppSettings {
  id: string;
  locale: string;
  theme: 'light' | 'dark' | 'system';
  farmName: string;
  contactInfo: string;
  lastExportAt?: string;
  onboardingCompleted: boolean;
}
