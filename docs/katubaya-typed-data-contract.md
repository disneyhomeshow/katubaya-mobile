# katubaya — Typed Data Contract Skeleton (Draft)
**Status:** Draft / MVP skeleton (intended to evolve)  
**Audience:** katubaya app + anyone building optional “Bridges” that ingest exports  
**Design goals:** modularity, strong typing, offline-first, portability, zero lock-in

---

## 0) Versioning policy (contracts, not vibes)

### Schema version
- `schemaVersion` uses **SemVer**: `MAJOR.MINOR.PATCH`
  - **MAJOR**: breaking change (a previously valid export may no longer validate)
  - **MINOR**: additive/backwards-compatible (new optional fields, new CSV files)
  - **PATCH**: clarifications, doc fixes, non-functional changes

### Compatibility promise
- katubaya **must be able to read/export** its own historic data.
- Export consumers (Bridges) should:
  - accept **same-major** versions
  - gracefully ignore unknown fields
  - treat missing optional fields as defaults

---

## 1) Export bundle: Availability Pack

### Intent
A portable artifact that:
- is human-inspectable
- is machine-ingestable
- can be shared via file (AirDrop/WhatsApp/Drive/USB)
- enables others to build optional services without owning farmer data

### Recommended packaging
- `.zip` bundle OR a folder (platform dependent)
- deterministic layout for easy ingestion:

```text
availability-pack/
  manifest.json
  json/
    farmer.json
    catalog.json
    zones.json
    harvest_events.json
    lots.json
    inventory_adjustments.json
    availability_list.json
    animal-groups.json          # 1.1.0, full_history only (app writes JSON under data/)
    animal-adjustments.json     # 1.1.0, full_history only
  csv/
    crops.csv
    cultivars.csv
    zones.csv
    harvest_events.csv
    lots.csv
    inventory_adjustments.csv
    availability_items.csv
    availability_windows.csv
    animal-groups.csv           # 1.1.0, full_history only
    animal-adjustments.csv      # 1.1.0, full_history only
  media/               # optional (reserved for future)
    ...
```

---

## 2) TypeScript contracts (compile-time)

> Notes:
> - IDs are branded strings for safety.
> - Dates are ISO-8601 strings (`2026-01-18T10:15:00Z`).
> - Quantities default to **DecimalString** to avoid floating point drift.
> - Currency/price is optional in MVP; keep it typed for later.

### 2.1 Common primitives

```ts
// Branding helper (nominal typing)
export type Brand<T, B extends string> = T & { readonly __brand: B };

// IDs
export type FarmerId = Brand<string, "FarmerId">;
export type SiteId = Brand<string, "SiteId">;
export type ZoneId = Brand<string, "ZoneId">;
export type CropId = Brand<string, "CropId">;
export type CultivarId = Brand<string, "CultivarId">;
export type HarvestEventId = Brand<string, "HarvestEventId">;
export type LotId = Brand<string, "LotId">;
export type AnimalGroupId = Brand<string, "AnimalGroupId">;
export type AvailabilityListId = Brand<string, "AvailabilityListId">;

// ISO date-time string
export type IsoDateTime = Brand<string, "IsoDateTime">; // runtime-validated

// Decimal quantity as string (e.g., "1", "2.5")
export type DecimalString = Brand<string, "DecimalString">; // runtime-validated

// Optional: Money (integer minor units to avoid floats)
export type CurrencyCode = "BRL" | "USD" | "EUR" | string; // allow extension
export interface Money {
  currency: CurrencyCode;
  minor: number; // e.g., cents
}
```

### 2.2 Enumerations

```ts
export type Unit =
  | "kg"
  | "g"
  | "unit"
  | "bunch"
  | "bag"
  | "tray"
  | "box"
  | "liter"
  | "ml"
  | "dozen"; // 1.1.0: eggs

export type InventoryAdjustmentReason =
  | "loss"
  | "damage"
  | "consumption"
  | "gift"
  | "sale"
  | "correction"
  | "processing";

export type SoilMoisture = "dry" | "ok" | "wet";

export type PhenologyStage =
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "senescent"
  | "dormant";

export type Signal =
  | "pestPressureLow"
  | "pestPressureMed"
  | "pestPressureHigh"
  | "diseaseSigns"
  | "pollinatorActivityLow"
  | "pollinatorActivityMed"
  | "pollinatorActivityHigh"
  | "waterStress";

export type GuildFunctionTag =
  | "nitrogenFixer"
  | "soilBuilder"
  | "nutrientCycler"
  | "pollinatorSupport"
  | "predatorHabitat"
  | "shadeProvider"
  | "windbreak"
  | "groundcover"
  | "livingMulch";
```

### 2.3 Core entities

```ts
export interface FarmerProfile {
  id: FarmerId;
  displayName: string;
  region?: string;          // e.g., city/state or general area
  practices?: string;       // short free text (e.g., "agrofloresta sintrópica")
  contact?: {
    phoneE164?: string;     // optional, farmer-controlled
    whatsapp?: string;      // optional
  };
}

export interface Site {
  id: SiteId;
  farmerId: FarmerId;
  name: string;
  notes?: string;
}

export interface Zone {
  id: ZoneId;
  siteId: SiteId;
  name: string;
  notes?: string;
  // Optional geospatial hints (keep minimal in MVP)
  geo?: {
    lat?: number;
    lon?: number;
    altitudeM?: number;
  };
}

export interface CropCategory {
  id: string;        // could be branded later if needed
  name: string;      // e.g., "Fruit", "Leafy Greens"
}

export interface Crop {
  id: CropId;
  categoryId: string;
  name: string;                  // e.g., "Banana"
  defaultUnit: Unit;
  shelfLifeDaysDefault?: number; // MVP: simple integer days
  tags?: GuildFunctionTag[];     // cooperation lens
  notes?: string;
}

export interface Cultivar {
  id: CultivarId;
  cropId: CropId;
  name: string;                 // e.g., "Prata"
  shelfLifeDaysOverride?: number;
  notes?: string;
}
```

### 2.4 Harvest + inventory

```ts
export interface ContextSnapshot {
  weatherNote?: string;
  soilMoisture?: SoilMoisture;
  phenologyStage?: PhenologyStage;
  signals?: Signal[];
}

export interface HarvestEvent {
  id: HarvestEventId;
  createdAt: IsoDateTime;
  occurredAt: IsoDateTime;       // when harvested
  cropId: CropId;
  cultivarId?: CultivarId;
  zoneId?: ZoneId;
  quantity: DecimalString;
  unit: Unit;
  notes?: string;
  context?: ContextSnapshot;
  animalGroupId?: AnimalGroupId; // 1.1.0: milking, egg collection, slaughter — which animal lot produced it
}

export interface Lot {
  id: LotId;
  cropId: CropId;
  cultivarId?: CultivarId;
  harvestEventId: HarvestEventId;
  createdAt: IsoDateTime;
  // For MVP, store remaining qty; derived totals are snapshots.
  quantityRemaining: DecimalString;
  unit: Unit;
  expiresAtEstimate?: IsoDateTime; // computed from shelf-life rule
  notes?: string;
}

export interface InventoryAdjustment {
  id: string; // can brand later
  createdAt: IsoDateTime;
  occurredAt: IsoDateTime;
  lotId?: LotId;     // prefer lot-based; allow crop-based for simplified workflows
  cropId?: CropId;
  deltaQuantity: DecimalString; // signed string: "-1.0", "+2.0" (or just "-1.0"/"2.0")
  unit: Unit;
  reason: InventoryAdjustmentReason;
  notes?: string;
  context?: ContextSnapshot;
  harvestEventId?: HarvestEventId; // 1.1.0: reason "processing" — the production this lot was turned into
}

// Optional materialized view for UI speed and exports
export interface InventorySnapshot {
  createdAt: IsoDateTime;
  byCrop: Array<{
    cropId: CropId;
    cultivarId?: CultivarId;
    quantityOnHand: DecimalString;
    unit: Unit;
    lots?: Array<{
      lotId: LotId;
      quantityRemaining: DecimalString;
      expiresAtEstimate?: IsoDateTime;
    }>;
  }>;
}
```

### 2.4b Livestock

> Added in 1.1.0. An animal lot ("lote de animais") is a group of animals managed together; its
> headcount changes only through adjustments. Production from it (milk, eggs, meat) is a
> `HarvestEvent` carrying `animalGroupId`. Mirrors `src/domain/contracts/types.ts`; `BaseEntity`
> is `{ id: string; createdAt: string; updatedAt: string }` (ISO 8601).

```ts
export type Species = 'cattle' | 'poultry' | 'swine' | 'goat' | 'sheep' | 'bees' | 'fish' | 'other';

export type AnimalAdjustmentReason =
  | 'birth'
  | 'purchase'
  | 'death'
  | 'sale'
  | 'slaughter'
  | 'correction';

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
```

### 2.5 Availability

```ts
export interface AvailabilityWindow {
  id: string; // brand later if needed
  startAt: IsoDateTime;
  endAt: IsoDateTime;
  notes?: string; // e.g., "Pickup mornings only"
}

export interface AvailabilityItem {
  cropId: CropId;
  cultivarId?: CultivarId;
  availableQty: DecimalString;
  unit: Unit;
  // Optional for later; keep typed
  price?: Money;
  notes?: string;
  windowIds?: string[];
  // Traceability (optional)
  lotIds?: LotId[];
}

export interface WhatsAppTemplate {
  // Deterministic text output generated from availability list
  text: string;
  locale?: string; // "pt-BR"
}

export interface AvailabilityList {
  id: AvailabilityListId;
  createdAt: IsoDateTime;
  periodLabel?: string; // "This week", "Today", etc.
  windows: AvailabilityWindow[];
  items: AvailabilityItem[];
  whatsappTemplate: WhatsAppTemplate;
}
```

### 2.6 Availability Pack (top-level export)

```ts
export interface ExportChecksums {
  // filePath -> checksum (sha256 recommended)
  [filePath: string]: string;
}

export interface AvailabilityPackManifest {
  schemaVersion: string;     // "1.1.0"
  exportedAt: IsoDateTime;
  appVersion: string;        // katubaya app version
  packId: string;            // uuid
  // Integrity fields (reserved)
  checksums?: ExportChecksums;
  signature?: {
    algorithm: "ed25519" | "rsa-pss" | string;
    publicKey: string;       // base64
    signature: string;       // base64
  };
  notes?: string;
}

export interface AvailabilityPack {
  manifest: AvailabilityPackManifest;
  farmer: FarmerProfile;
  catalog: {
    categories: CropCategory[];
    crops: Crop[];
    cultivars: Cultivar[];
  };
  sites: Site[];
  zones: Zone[];
  harvestEvents: HarvestEvent[];
  lots: Lot[];
  inventoryAdjustments: InventoryAdjustment[];
  // Optional snapshot for convenience
  inventorySnapshot?: InventorySnapshot;
  availabilityList: AvailabilityList;
}
```

---

## 3) Runtime validation (Zod skeleton)
> Use Zod (or similar) to validate:
> - ISO datetime format
> - Decimal strings
> - enums
> - referential integrity checks (optional step)

```ts
import { z } from "zod";

export const IsoDateTimeSchema = z.string().datetime(); // refine if needed
export const DecimalStringSchema = z.string().regex(/^-?\d+(\.\d+)?$/);

export const UnitSchema = z.enum([
  "kg","g","unit","bunch","bag","tray","box","liter","ml","dozen"
]);

// Example: Crop schema (partial)
export const CropSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: z.string().min(1),
  defaultUnit: UnitSchema,
  shelfLifeDaysDefault: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
```

---

## 4) JSON Schema stubs (export-level contracts)
> Goal: Bridges can validate with any language.

### 4.1 Top-level schema stub (`manifest.json` references)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://katubaya.example/schemas/availability-pack/1.1.0.json",
  "title": "AvailabilityPack",
  "type": "object",
  "required": ["manifest", "farmer", "catalog", "sites", "zones", "harvestEvents", "lots", "inventoryAdjustments", "availabilityList"],
  "properties": {
    "manifest": { "$ref": "manifest.schema.json" },
    "farmer": { "$ref": "farmer.schema.json" },
    "catalog": { "$ref": "catalog.schema.json" },
    "sites": { "type": "array", "items": { "$ref": "site.schema.json" } },
    "zones": { "type": "array", "items": { "$ref": "zone.schema.json" } },
    "harvestEvents": { "type": "array", "items": { "$ref": "harvest-event.schema.json" } },
    "lots": { "type": "array", "items": { "$ref": "lot.schema.json" } },
    "inventoryAdjustments": { "type": "array", "items": { "$ref": "inventory-adjustment.schema.json" } },
    "animalGroups": { "type": "array", "items": { "$ref": "animal-group.schema.json" } },
    "animalAdjustments": { "type": "array", "items": { "$ref": "animal-adjustment.schema.json" } },
    "inventorySnapshot": { "$ref": "inventory-snapshot.schema.json" },
    "availabilityList": { "$ref": "availability-list.schema.json" }
  },
  "additionalProperties": false
}
```

### 4.2 ISO datetime + decimal definitions (shared)
```json
{
  "$id": "defs.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "SharedDefs",
  "type": "object",
  "definitions": {
    "IsoDateTime": {
      "type": "string",
      "format": "date-time"
    },
    "DecimalString": {
      "type": "string",
      "pattern": "^-?\\d+(\\.\\d+)?$"
    }
  }
}
```

> Keep JSON Schema modular: one file per entity, all under a versioned folder.

---

## 5) CSV contracts (human-friendly + spreadsheet-compatible)

### CSV general rules
- UTF-8
- header row required
- ISO datetimes in UTC (`Z`) recommended
- `DecimalString` columns stored as strings (don’t force locale decimals)
- IDs are stable strings
- The current exporter writes each entity's field names as-is (camelCase, e.g. `cropId`) under `csv/<table>.csv` with hyphenated file names (`animal-groups.csv`); the snake_case tables below describe the target contract for bridges, not today's dump

### 5.1 `crops.csv`
| column | required | type | notes |
|---|---:|---|---|
| crop_id | ✅ | string | matches `Crop.id` |
| category_id | ✅ | string | |
| name | ✅ | string | |
| default_unit | ✅ | Unit | |
| shelf_life_days_default |  | int | |
| tags |  | string | `;` separated |
| notes |  | string | |

### 5.2 `cultivars.csv`
| column | required | type | notes |
|---|---:|---|---|
| cultivar_id | ✅ | string | |
| crop_id | ✅ | string | |
| name | ✅ | string | |
| shelf_life_days_override |  | int | |
| notes |  | string | |

### 5.3 `zones.csv`
| column | required | type | notes |
|---|---:|---|---|
| zone_id | ✅ | string | |
| site_id | ✅ | string | |
| name | ✅ | string | |
| notes |  | string | |
| lat |  | number | optional |
| lon |  | number | optional |
| altitude_m |  | number | optional |

### 5.4 `harvest_events.csv`
| column | required | type | notes |
|---|---:|---|---|
| harvest_event_id | ✅ | string | |
| occurred_at | ✅ | IsoDateTime | |
| created_at | ✅ | IsoDateTime | |
| crop_id | ✅ | string | |
| cultivar_id |  | string | |
| zone_id |  | string | |
| quantity | ✅ | DecimalString | |
| unit | ✅ | Unit | |
| notes |  | string | |
| soil_moisture |  | enum | dry/ok/wet |
| phenology_stage |  | enum | |
| signals |  | string | `;` separated |
| weather_note |  | string | |

### 5.5 `lots.csv`
| column | required | type | notes |
|---|---:|---|---|
| lot_id | ✅ | string | |
| harvest_event_id | ✅ | string | |
| crop_id | ✅ | string | |
| cultivar_id |  | string | |
| created_at | ✅ | IsoDateTime | |
| quantity_remaining | ✅ | DecimalString | |
| unit | ✅ | Unit | |
| expires_at_estimate |  | IsoDateTime | |
| notes |  | string | |

### 5.6 `inventory_adjustments.csv`
| column | required | type | notes |
|---|---:|---|---|
| adjustment_id | ✅ | string | |
| occurred_at | ✅ | IsoDateTime | |
| created_at | ✅ | IsoDateTime | |
| lot_id |  | string | prefer if available |
| crop_id |  | string | allowed if lot missing |
| delta_quantity | ✅ | DecimalString | signed |
| unit | ✅ | Unit | |
| reason | ✅ | enum | loss/damage/consumption/gift/sale/correction/processing |
| notes |  | string | |
| signals |  | string | `;` separated |
| weather_note |  | string | |

### 5.7 `availability_windows.csv`
| column | required | type | notes |
|---|---:|---|---|
| window_id | ✅ | string | |
| start_at | ✅ | IsoDateTime | |
| end_at | ✅ | IsoDateTime | |
| notes |  | string | |

### 5.8 `availability_items.csv`
| column | required | type | notes |
|---|---:|---|---|
| list_id | ✅ | string | AvailabilityList.id |
| crop_id | ✅ | string | |
| cultivar_id |  | string | |
| available_qty | ✅ | DecimalString | |
| unit | ✅ | Unit | |
| window_ids |  | string | `;` separated |
| lot_ids |  | string | `;` separated |
| price_currency |  | string | optional |
| price_minor |  | int | optional |
| notes |  | string | |

### 5.9 `animal-groups.csv` (1.1.0, full_history only)
| column | required | type | notes |
|---|---:|---|---|
| animal_group_id | ✅ | string | matches `AnimalGroup.id` |
| name | ✅ | string | |
| species | ✅ | enum | cattle/poultry/swine/goat/sheep/bees/fish/other |
| initial_headcount | ✅ | int | heads when the lot was opened |
| headcount | ✅ | int | current heads; 0 = closed lot |
| zone_id |  | string | |
| started_at | ✅ | IsoDateTime | |
| created_at | ✅ | IsoDateTime | |
| notes |  | string | |

### 5.10 `animal-adjustments.csv` (1.1.0, full_history only)
| column | required | type | notes |
|---|---:|---|---|
| adjustment_id | ✅ | string | |
| animal_group_id | ✅ | string | |
| adjusted_at | ✅ | IsoDateTime | |
| created_at | ✅ | IsoDateTime | |
| delta | ✅ | int | signed; negative for exits |
| reason | ✅ | enum | birth/purchase/death/sale/slaughter/correction |
| harvest_event_id |  | string | slaughter: the meat harvest it produced |
| notes |  | string | |

---

## 6) Minimal example (Availability Pack JSON)
```json
{
  "manifest": {
    "schemaVersion": "1.1.0",
    "exportedAt": "2026-01-18T12:00:00Z",
    "appVersion": "0.1.0",
    "packId": "7f9c8c2a-1d7e-4b9b-9d9c-7a2b0d7c0a11"
  },
  "farmer": { "id": "farmer_1", "displayName": "Sítio do Vale" },
  "catalog": {
    "categories": [{ "id": "fruit", "name": "Fruit" }],
    "crops": [{ "id": "crop_banana", "categoryId": "fruit", "name": "Banana", "defaultUnit": "kg", "shelfLifeDaysDefault": 7 }],
    "cultivars": [{ "id": "cult_prata", "cropId": "crop_banana", "name": "Prata" }]
  },
  "sites": [{ "id": "site_1", "farmerId": "farmer_1", "name": "Main Site" }],
  "zones": [{ "id": "zone_1", "siteId": "site_1", "name": "North Swale" }],
  "harvestEvents": [],
  "lots": [],
  "inventoryAdjustments": [],
  "availabilityList": {
    "id": "list_1",
    "createdAt": "2026-01-18T12:00:00Z",
    "windows": [],
    "items": [],
    "whatsappTemplate": { "text": "Disponíveis esta semana:\\n\\n(sem itens ainda)" }
  }
}
```

---

## 7) Planned evolution points (reserved but not required in MVP)
- `manifest.checksums` + `manifest.signature` for integrity/verification services
- `media/` for photos/cards (with references from JSON)
- richer shelf-life rules (storage conditions, temperature bands)
- stronger referential integrity validation step (IDs must exist)
- events/snapshots split (append-only event log + derived views)

---

## 8) Change log template (keep contracts honest)
- **[1.0.0]** initial MVP export contracts
- **[1.1.0]** 2026-10-30 — livestock: animal lots, processing link, dozen unit, animal category type
- **[2.0.0]** breaking rename: `HarvestEvent.occurredAt` → `harvestedAt`
