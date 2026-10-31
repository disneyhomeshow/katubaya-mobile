/**
 * IndexedDB Schema using Dexie
 * katubaya Local Database
 */

import Dexie, { type Table } from 'dexie';
import type {
  CropCategory,
  Crop,
  Cultivar,
  Zone,
  HarvestEvent,
  Lot,
  InventoryAdjustment,
  AvailabilityList,
  AvailabilityConfig,
  AppSettings,
  AnimalGroup,
  AnimalAdjustment
} from '@/domain/contracts/types';

export class FarmerCoreDB extends Dexie {
  // Tables
  categories!: Table<CropCategory, string>;
  crops!: Table<Crop, string>;
  cultivars!: Table<Cultivar, string>;
  zones!: Table<Zone, string>;
  harvestEvents!: Table<HarvestEvent, string>;
  lots!: Table<Lot, string>;
  inventoryAdjustments!: Table<InventoryAdjustment, string>;
  availabilityLists!: Table<AvailabilityList, string>;
  availabilityConfig!: Table<AvailabilityConfig, string>;
  appSettings!: Table<AppSettings, string>;
  animalGroups!: Table<AnimalGroup, string>;
  animalAdjustments!: Table<AnimalAdjustment, string>;

  constructor() {
    super('FarmerCoreDB');

    this.version(1).stores({
      // Primary key is 'id', indexes follow
      categories: 'id, type, sortOrder',
      crops: 'id, categoryId, name, isFavorite, lastUsedAt',
      cultivars: 'id, cropId, name',
      zones: 'id, sortOrder',
      harvestEvents: 'id, cropId, cultivarId, zoneId, harvestedAt, lotId',
      lots: 'id, cropId, cultivarId, harvestEventId, expiresAtEstimate, quantityRemaining',
      inventoryAdjustments: 'id, lotId, cropId, adjustedAt, reason',
      availabilityLists: 'id, createdAt, isStale',
      availabilityConfig: 'id',
      appSettings: 'id'
    });

    // v2: livestock. Only changed/new tables need re-declaring.
    this.version(2).stores({
      harvestEvents: 'id, cropId, cultivarId, zoneId, harvestedAt, lotId, animalGroupId',
      inventoryAdjustments: 'id, lotId, cropId, adjustedAt, reason, harvestEventId',
      animalGroups: 'id, name, species, zoneId',
      animalAdjustments: 'id, groupId, adjustedAt, reason, harvestEventId'
    });
  }
}

// Singleton instance
export const db = new FarmerCoreDB();
