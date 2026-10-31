/**
 * Seed data for development
 * Predefined categories and sample crops
 */

import { db } from './schema';
import type { CropCategory, Crop, AppSettings, AnimalGroup } from '@/domain/contracts/types';

const now = new Date().toISOString();

// Helper to generate dates relative to now
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};


/**
 * Predefined crop categories
 */
export const DEFAULT_CATEGORIES: Omit<CropCategory, 'createdAt' | 'updatedAt'>[] = [
  { id: 'cat-fruits', name: 'Frutas', type: 'fruits', icon: '🍎', color: 'hsl(0, 70%, 50%)', sortOrder: 0 },
  { id: 'cat-vegetables', name: 'Hortaliças', type: 'vegetables', icon: '🥬', color: 'hsl(120, 60%, 40%)', sortOrder: 1 },
  { id: 'cat-grains', name: 'Grãos', type: 'grains', icon: '🌾', color: 'hsl(45, 70%, 50%)', sortOrder: 2 },
  { id: 'cat-herbs', name: 'Ervas', type: 'herbs', icon: '🌿', color: 'hsl(140, 50%, 45%)', sortOrder: 3 },
  { id: 'cat-nuts', name: 'Castanhas', type: 'nuts', icon: '🌰', color: 'hsl(30, 50%, 40%)', sortOrder: 4 },
  { id: 'cat-roots', name: 'Raízes', type: 'roots', icon: '🥔', color: 'hsl(25, 40%, 45%)', sortOrder: 5 },
  // Livestock
  { id: 'cat-eggs', name: 'Ovos', type: 'animal', icon: '🥚', color: 'hsl(40, 60%, 60%)', sortOrder: 6 },
  { id: 'cat-dairy', name: 'Laticínios', type: 'animal', icon: '🧀', color: 'hsl(48, 80%, 55%)', sortOrder: 7 },
  { id: 'cat-meat', name: 'Carnes', type: 'animal', icon: '🥩', color: 'hsl(355, 60%, 50%)', sortOrder: 8 },
  { id: 'cat-honey', name: 'Mel', type: 'animal', icon: '🍯', color: 'hsl(35, 90%, 50%)', sortOrder: 9 },
];

/**
 * Sample crops for development/demo
 */
export const SAMPLE_CROPS: Omit<Crop, 'createdAt' | 'updatedAt'>[] = [
  // Fruits
  { id: 'crop-banana', categoryId: 'cat-fruits', name: 'Banana', defaultUnit: 'kg', shelfLifeDaysDefault: 7, pricePerUnit: 6.50, isFavorite: true },
  { id: 'crop-abacate', categoryId: 'cat-fruits', name: 'Abacate', defaultUnit: 'unit', shelfLifeDaysDefault: 5, pricePerUnit: 4.00, isFavorite: true },
  { id: 'crop-laranja', categoryId: 'cat-fruits', name: 'Laranja', defaultUnit: 'kg', shelfLifeDaysDefault: 14, pricePerUnit: 5.00, isFavorite: false },
  { id: 'crop-manga', categoryId: 'cat-fruits', name: 'Manga', defaultUnit: 'unit', shelfLifeDaysDefault: 7, pricePerUnit: 3.50, isFavorite: false },
  { id: 'crop-mamao', categoryId: 'cat-fruits', name: 'Mamão', defaultUnit: 'unit', shelfLifeDaysDefault: 5, pricePerUnit: 8.00, isFavorite: false },
  { id: 'crop-limao', categoryId: 'cat-fruits', name: 'Limão', defaultUnit: 'kg', shelfLifeDaysDefault: 21, pricePerUnit: 4.50, isFavorite: false },
  
  // Vegetables
  { id: 'crop-tomate', categoryId: 'cat-vegetables', name: 'Tomate', defaultUnit: 'kg', shelfLifeDaysDefault: 7, pricePerUnit: 8.00, isFavorite: true },
  { id: 'crop-alface', categoryId: 'cat-vegetables', name: 'Alface', defaultUnit: 'unit', shelfLifeDaysDefault: 5, pricePerUnit: 3.00, isFavorite: false },
  { id: 'crop-cenoura', categoryId: 'cat-vegetables', name: 'Cenoura', defaultUnit: 'kg', shelfLifeDaysDefault: 14, pricePerUnit: 6.00, isFavorite: false },
  { id: 'crop-pimenta', categoryId: 'cat-vegetables', name: 'Pimenta', defaultUnit: 'kg', shelfLifeDaysDefault: 10, pricePerUnit: 15.00, isFavorite: false },
  
  // Herbs
  { id: 'crop-manjericao', categoryId: 'cat-herbs', name: 'Manjericão', defaultUnit: 'bunch', shelfLifeDaysDefault: 5, pricePerUnit: 5.00, isFavorite: false },
  { id: 'crop-hortela', categoryId: 'cat-herbs', name: 'Hortelã', defaultUnit: 'bunch', shelfLifeDaysDefault: 5, pricePerUnit: 4.00, isFavorite: false },
  { id: 'crop-coentro', categoryId: 'cat-herbs', name: 'Coentro', defaultUnit: 'bunch', shelfLifeDaysDefault: 4, pricePerUnit: 4.00, isFavorite: false },
  
  // Roots
  { id: 'crop-mandioca', categoryId: 'cat-roots', name: 'Mandioca', defaultUnit: 'kg', shelfLifeDaysDefault: 7, pricePerUnit: 5.00, isFavorite: false },
  { id: 'crop-batata-doce', categoryId: 'cat-roots', name: 'Batata Doce', defaultUnit: 'kg', shelfLifeDaysDefault: 14, pricePerUnit: 7.00, isFavorite: false },
  
  // Nuts
  { id: 'crop-castanha', categoryId: 'cat-nuts', name: 'Castanha do Pará', defaultUnit: 'kg', shelfLifeDaysDefault: 90, pricePerUnit: 80.00, isFavorite: false },

  // Livestock
  { id: 'crop-leite', categoryId: 'cat-dairy', name: 'Leite', defaultUnit: 'liter', shelfLifeDaysDefault: 3, pricePerUnit: 5.00, isFavorite: true },
  { id: 'crop-queijo', categoryId: 'cat-dairy', name: 'Queijo Minas', defaultUnit: 'kg', shelfLifeDaysDefault: 30, pricePerUnit: 60.00, isFavorite: false },
  { id: 'crop-ovos', categoryId: 'cat-eggs', name: 'Ovos Caipiras', defaultUnit: 'dozen', shelfLifeDaysDefault: 21, pricePerUnit: 15.00, isFavorite: true },
  { id: 'crop-frango', categoryId: 'cat-meat', name: 'Frango Caipira', defaultUnit: 'kg', shelfLifeDaysDefault: 3, pricePerUnit: 25.00, isFavorite: false },
  { id: 'crop-mel', categoryId: 'cat-honey', name: 'Mel', defaultUnit: 'kg', shelfLifeDaysDefault: 365, pricePerUnit: 50.00, isFavorite: false },
];

/**
 * Sample animal lots ("lotes de animais")
 */
export const SAMPLE_ANIMAL_GROUPS: Omit<AnimalGroup, 'createdAt' | 'updatedAt'>[] = [
  { id: 'animals-vacas', name: 'Vacas em lactação', species: 'cattle', initialHeadcount: 6, headcount: 6, startedAt: daysAgo(400) },
  { id: 'animals-galinhas', name: 'Galinhas poedeiras', species: 'poultry', initialHeadcount: 30, headcount: 28, startedAt: daysAgo(120) },
];

/**
 * Sample harvest events for testing
 */
export const SAMPLE_HARVESTS: Omit<import('@/domain/contracts/types').HarvestEvent, 'createdAt' | 'updatedAt'>[] = [
  { id: 'harvest-1', cropId: 'crop-banana', quantity: 15, unit: 'kg', harvestedAt: daysAgo(0), lotId: 'lot-1', notes: 'Colheita da manhã' },
  { id: 'harvest-2', cropId: 'crop-tomate', quantity: 8, unit: 'kg', harvestedAt: daysAgo(1), lotId: 'lot-2' },
  { id: 'harvest-3', cropId: 'crop-abacate', quantity: 20, unit: 'unit', harvestedAt: daysAgo(1), lotId: 'lot-3' },
  { id: 'harvest-4', cropId: 'crop-alface', quantity: 12, unit: 'unit', harvestedAt: daysAgo(2), lotId: 'lot-4' },
  { id: 'harvest-5', cropId: 'crop-manjericao', quantity: 6, unit: 'bunch', harvestedAt: daysAgo(2), lotId: 'lot-5' },
  { id: 'harvest-6', cropId: 'crop-laranja', quantity: 25, unit: 'kg', harvestedAt: daysAgo(3), lotId: 'lot-6' },
  { id: 'harvest-7', cropId: 'crop-cenoura', quantity: 10, unit: 'kg', harvestedAt: daysAgo(4), lotId: 'lot-7' },
  { id: 'harvest-8', cropId: 'crop-banana', quantity: 12, unit: 'kg', harvestedAt: daysAgo(5), lotId: 'lot-8' },
];

/**
 * Sample lots for testing inventory
 */
export const SAMPLE_LOTS: Omit<import('@/domain/contracts/types').Lot, 'createdAt' | 'updatedAt'>[] = [
  { id: 'lot-1', cropId: 'crop-banana', harvestEventId: 'harvest-1', initialQuantity: 15, quantityRemaining: 15, unit: 'kg', harvestedAt: daysAgo(0), expiresAtEstimate: daysFromNow(7) },
  { id: 'lot-2', cropId: 'crop-tomate', harvestEventId: 'harvest-2', initialQuantity: 8, quantityRemaining: 6, unit: 'kg', harvestedAt: daysAgo(1), expiresAtEstimate: daysFromNow(6) },
  { id: 'lot-3', cropId: 'crop-abacate', harvestEventId: 'harvest-3', initialQuantity: 20, quantityRemaining: 18, unit: 'unit', harvestedAt: daysAgo(1), expiresAtEstimate: daysFromNow(4) },
  { id: 'lot-4', cropId: 'crop-alface', harvestEventId: 'harvest-4', initialQuantity: 12, quantityRemaining: 8, unit: 'unit', harvestedAt: daysAgo(2), expiresAtEstimate: daysFromNow(3) },
  { id: 'lot-5', cropId: 'crop-manjericao', harvestEventId: 'harvest-5', initialQuantity: 6, quantityRemaining: 4, unit: 'bunch', harvestedAt: daysAgo(2), expiresAtEstimate: daysFromNow(3) },
  { id: 'lot-6', cropId: 'crop-laranja', harvestEventId: 'harvest-6', initialQuantity: 25, quantityRemaining: 20, unit: 'kg', harvestedAt: daysAgo(3), expiresAtEstimate: daysFromNow(11) },
  { id: 'lot-7', cropId: 'crop-cenoura', harvestEventId: 'harvest-7', initialQuantity: 10, quantityRemaining: 10, unit: 'kg', harvestedAt: daysAgo(4), expiresAtEstimate: daysFromNow(10) },
  { id: 'lot-8', cropId: 'crop-banana', harvestEventId: 'harvest-8', initialQuantity: 12, quantityRemaining: 5, unit: 'kg', harvestedAt: daysAgo(5), expiresAtEstimate: daysFromNow(2), notes: 'Lote antigo, vender primeiro' },
];

/**
 * Default app settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  id: 'app-settings',
  locale: 'pt-BR',
  theme: 'system',
  farmName: '',
  contactInfo: '',
  onboardingCompleted: false
};

/**
 * Seed the database with default data
 * Only seeds if categories table is empty
 */
export async function seedDatabase(): Promise<boolean> {
  try {
    const existingCategories = await db.categories.count();

    if (existingCategories > 0) {
      // Defaults added in later versions (e.g. livestock) must reach existing databases
      const known = new Set(await db.categories.toCollection().primaryKeys());
      const missing = DEFAULT_CATEGORIES.filter(cat => !known.has(cat.id));
      if (missing.length > 0) {
        await db.categories.bulkAdd(missing.map(cat => ({ ...cat, createdAt: now, updatedAt: now })));
      }
      console.log('[Seed] Database already seeded, skipping...');
      return false;
    }

    console.log('[Seed] Seeding database with default data...');

    // Seed categories
    await db.categories.bulkAdd(
      DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        createdAt: now,
        updatedAt: now
      }))
    );

    // Seed sample crops
    await db.crops.bulkAdd(
      SAMPLE_CROPS.map(crop => ({
        ...crop,
        createdAt: now,
        updatedAt: now
      }))
    );

    // Seed sample harvests
    await db.harvestEvents.bulkAdd(
      SAMPLE_HARVESTS.map(harvest => ({
        ...harvest,
        createdAt: now,
        updatedAt: now
      }))
    );

    // Seed sample lots
    await db.lots.bulkAdd(
      SAMPLE_LOTS.map(lot => ({
        ...lot,
        createdAt: now,
        updatedAt: now
      }))
    );

    // Seed sample animal lots
    await db.animalGroups.bulkAdd(
      SAMPLE_ANIMAL_GROUPS.map(group => ({ ...group, createdAt: now, updatedAt: now }))
    );

    // Initialize app settings
    await db.appSettings.put(DEFAULT_SETTINGS);

    console.log('[Seed] Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('[Seed] Failed to seed database:', error);
    throw error;
  }
}

/**
 * Reset database to clean state (for development)
 */
export async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
  await seedDatabase();
}

/**
 * Force re-seed (clears existing data)
 */
export async function forceSeed(): Promise<void> {
  await db.categories.clear();
  await db.crops.clear();
  await db.harvestEvents.clear();
  await db.lots.clear();
  await seedDatabase();
}
