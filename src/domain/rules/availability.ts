/**
 * Availability message generation rules
 * Deterministic, no randomness
 */

import type { 
  AvailabilityList, 
  AvailabilityItem, 
  InventorySnapshot,
  InventorySnapshotItem,
  UnitType 
} from '../contracts/types';

/**
 * Map crop names to emojis for WhatsApp message
 */
const CROP_EMOJIS: Record<string, string> = {
  // Fruits
  'banana': '🍌',
  'abacate': '🥑',
  'laranja': '🍊',
  'limão': '🍋',
  'maçã': '🍎',
  'manga': '🥭',
  'mamão': '🍈',
  'abacaxi': '🍍',
  'melancia': '🍉',
  'uva': '🍇',
  'morango': '🍓',
  'coco': '🥥',
  'goiaba': '🍐',
  // Vegetables
  'tomate': '🍅',
  'cenoura': '🥕',
  'batata': '🥔',
  'cebola': '🧅',
  'alho': '🧄',
  'pepino': '🥒',
  'pimentão': '🫑',
  'pimenta': '🌶️',
  'milho': '🌽',
  'brócolis': '🥦',
  'alface': '🥬',
  'berinjela': '🍆',
  'abóbora': '🎃',
  // Herbs
  'manjericão': '🌿',
  'hortelã': '🌿',
  'coentro': '🌿',
  'salsinha': '🌿',
  // Grains
  'feijão': '🫘',
  'arroz': '🍚',
  // Nuts
  'castanha': '🌰',
  'amendoim': '🥜',
  // Livestock
  'leite': '🥛',
  'queijo': '🧀',
  'manteiga': '🧈',
  'iogurte': '🥛',
  'ovo': '🥚',
  'frango': '🍗',
  'carne': '🥩',
  'mel': '🍯',
  // Default
  'default': '🌱'
};

/**
 * Get emoji for a crop name (case-insensitive partial match)
 */
export function getCropEmoji(cropName: string): string {
  const normalized = cropName.toLowerCase().trim();
  
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (normalized.includes(key)) {
      return emoji;
    }
  }
  
  return CROP_EMOJIS.default;
}

/**
 * Format unit for display
 */
export function formatUnit(unit: UnitType, quantity: number): string {
  const unitLabels: Record<UnitType, { singular: string; plural: string }> = {
    kg: { singular: 'kg', plural: 'kg' },
    g: { singular: 'g', plural: 'g' },
    unit: { singular: 'unid', plural: 'unid' },
    bunch: { singular: 'maço', plural: 'maços' },
    liter: { singular: 'L', plural: 'L' },
    ml: { singular: 'ml', plural: 'ml' },
    box: { singular: 'cx', plural: 'cx' },
    bag: { singular: 'saco', plural: 'sacos' },
    dozen: { singular: 'dz', plural: 'dz' }
  };
  
  const label = unitLabels[unit];
  return quantity === 1 ? label.singular : label.plural;
}

/**
 * Format quantity with proper decimal handling
 */
export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }
  return quantity.toFixed(1).replace('.0', '');
}

/**
 * Format price for display in WhatsApp message
 */
export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

/**
 * Generate deterministic WhatsApp availability message
 * Shows prices instead of quantities
 */
export function generateAvailabilityMessage(list: AvailabilityList): string {
  const lines: string[] = [];
  
  // Header
  const header = list.headerText || `🌿 Produtos Disponíveis${list.farmName ? ` - ${list.farmName}` : ''}`;
  lines.push(header);
  lines.push('━━━━━━━━━━━━━━━━━━━━━');
  
  // Window name if present
  if (list.windowName) {
    lines.push(`📅 ${list.windowName}`);
    lines.push('');
  }
  
  // Items (only included ones, sorted by sortOrder)
  const includedItems = list.items
    .filter(item => item.isIncluded && item.quantity > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  for (const item of includedItems) {
    const emoji = getCropEmoji(item.cropName);
    const cultivar = item.cultivarName ? ` (${item.cultivarName})` : '';
    const unit = formatUnit(item.unit, 1); // singular unit for price display
    const priceText = item.pricePerUnit 
      ? ` - ${formatPrice(item.pricePerUnit)}/${unit}`
      : '';
    
    lines.push(`${emoji} ${item.cropName}${cultivar}${priceText}`);
  }
  
  // Footer
  lines.push('━━━━━━━━━━━━━━━━━━━━━');
  
  if (list.footerText) {
    lines.push(list.footerText);
  }
  
  if (list.contactInfo) {
    lines.push(`📞 Contato: ${list.contactInfo}`);
  }
  
  return lines.join('\n');
}

/**
 * Create availability items from inventory snapshot
 */
export function createAvailabilityItemsFromSnapshot(
  snapshot: InventorySnapshot
): AvailabilityItem[] {
  return snapshot.items
    .filter(item => item.totalQuantity > 0)
    .map((item, index) => ({
      id: crypto.randomUUID(),
      cropId: item.cropId,
      cropName: item.cropName,
      cultivarId: item.cultivarId,
      cultivarName: item.cultivarName,
      quantity: item.totalQuantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      isIncluded: true,
      sortOrder: index
    }));
}

/**
 * Check if availability list is stale (inventory changed since generation)
 */
export function isAvailabilityStale(
  list: AvailabilityList,
  currentSnapshot: InventorySnapshot
): boolean {
  // Simple staleness check: compare snapshot timestamps
  return new Date(list.inventorySnapshotAt) < new Date(currentSnapshot.generatedAt);
}
