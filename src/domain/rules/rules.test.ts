import { describe, expect, it } from 'vitest';
import { generateAvailabilityMessage } from './availability';
import { getExpirationStatus } from './expiration';

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000);

describe('getExpirationStatus', () => {
  it('classifies by days remaining (fresh > 3, expiring 1-3, expired <= 0)', () => {
    expect(getExpirationStatus(inDays(10))).toBe('fresh');
    expect(getExpirationStatus(inDays(4))).toBe('fresh');
    expect(getExpirationStatus(inDays(3))).toBe('expiring_soon');
    expect(getExpirationStatus(inDays(1))).toBe('expiring_soon');
    expect(getExpirationStatus(inDays(0))).toBe('expired');
    expect(getExpirationStatus(inDays(-1))).toBe('expired');
  });
});

describe('generateAvailabilityMessage', () => {
  it('lists only included items, sorted, with price per unit', () => {
    const message = generateAvailabilityMessage({
      id: 'list', createdAt: '', updatedAt: '', isStale: false, inventorySnapshotAt: '',
      farmName: 'Sítio Verde', contactInfo: '(11) 99999-0000', footerText: 'Entregas no sábado',
      items: [
        { id: 'b', cropId: 'c2', cropName: 'Tomate', quantity: 5, unit: 'kg', pricePerUnit: 8, isIncluded: true, sortOrder: 1 },
        { id: 'a', cropId: 'c1', cropName: 'Banana', quantity: 3, unit: 'kg', pricePerUnit: 6.5, isIncluded: true, sortOrder: 0 },
        { id: 'x', cropId: 'c3', cropName: 'Alface', quantity: 2, unit: 'unit', isIncluded: false, sortOrder: 2 },
      ],
    });

    expect(message).toBe([
      '🌿 Produtos Disponíveis - Sítio Verde',
      '━━━━━━━━━━━━━━━━━━━━━',
      '🍌 Banana - R$ 6,50/kg',
      '🍅 Tomate - R$ 8,00/kg',
      '━━━━━━━━━━━━━━━━━━━━━',
      'Entregas no sábado',
      '📞 Contato: (11) 99999-0000',
    ].join('\n'));
  });
});
