/**
 * Hook for managing cultivars
 */

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import type { Cultivar } from '@/domain/contracts/types';

export function useCultivars(cropId?: string) {
  const cultivars = useLiveQuery(
    () => cropId 
      ? db.cultivars.where('cropId').equals(cropId).toArray()
      : db.cultivars.toArray(),
    [cropId]
  );
  const isLoading = cultivars === undefined;

  const createCultivar = useCallback(async (
    data: Omit<Cultivar, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const cultivar: Cultivar = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    await db.cultivars.add(cultivar);
    return cultivar;
  }, []);

  const updateCultivar = useCallback(async (
    id: string,
    data: Partial<Omit<Cultivar, 'id' | 'createdAt'>>
  ) => {
    await db.cultivars.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }, []);

  const deleteCultivar = useCallback(async (id: string) => {
    await db.cultivars.delete(id);
  }, []);

  return {
    cultivars: cultivars || [],
    isLoading,
    createCultivar,
    updateCultivar,
    deleteCultivar,
  };
}
