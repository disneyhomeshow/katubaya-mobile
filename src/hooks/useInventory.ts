/**
 * Inventory Hook - Manages inventory state and operations
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db/schema';
import { inventoryRepository, lotRepository, cropRepository } from '@/data/repositories';
import type { AdjustmentReason } from '@/domain/contracts/types';
import { getExpirationStatus, getDaysUntilExpiry } from '@/domain/rules/expiration';

export function useInventory() {
  // Live query for active lots
  const lots = useLiveQuery(
    () => lotRepository.getActive(),
    [],
    []
  );

  // Live query for lots expiring soon
  const expiringLots = useLiveQuery(
    () => lotRepository.getExpiringSoon(3),
    [],
    []
  );


  // Adjust lot quantity
  const adjustLot = async (
    lotId: string,
    quantityDelta: number,
    reason: AdjustmentReason,
    notes?: string
  ) => {
    return inventoryRepository.createAdjustment({
      lotId,
      quantityDelta,
      reason,
      notes
    });
  };

  // Get lot details with crop info
  const getLotWithDetails = async (lotId: string) => {
    const lot = await lotRepository.getById(lotId);
    if (!lot) return null;

    const crop = await cropRepository.getById(lot.cropId);
    const cultivar = lot.cultivarId 
      ? await db.cultivars.get(lot.cultivarId)
      : undefined;

    return {
      lot,
      crop,
      cultivar,
      expirationStatus: getExpirationStatus(lot.expiresAtEstimate),
      daysUntilExpiry: getDaysUntilExpiry(lot.expiresAtEstimate)
    };
  };

  return {
    lots: lots ?? [],
    expiringLots: expiringLots ?? [],
    adjustLot,
    getLotWithDetails
  };
}

export function useLots(cropId?: string) {
  const lots = useLiveQuery(
    () => cropId 
      ? lotRepository.getByCrop(cropId)
      : lotRepository.getActive(),
    [cropId],
    []
  );

  return {
    lots: lots ?? []
  };
}
