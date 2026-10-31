/**
 * Hook for managing crops
 */

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import { cropRepository } from '@/data/repositories';
import type { Crop } from '@/domain/contracts/types';

export function useCrops(categoryId?: string) {
  const crops = useLiveQuery(
    () => categoryId 
      ? cropRepository.getByCategory(categoryId) 
      : cropRepository.getAll(),
    [categoryId]
  );
  const isLoading = crops === undefined;

  const createCrop = useCallback(async (
    data: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    return cropRepository.create(data);
  }, []);

  const updateCrop = useCallback(async (
    id: string,
    data: Partial<Omit<Crop, 'id' | 'createdAt'>>
  ) => {
    return cropRepository.update(id, data);
  }, []);

  const deleteCrop = useCallback(async (id: string) => {
    return cropRepository.delete(id);
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    return cropRepository.toggleFavorite(id);
  }, []);

  const searchCrops = useCallback(async (query: string) => {
    return cropRepository.search(query);
  }, []);

  const getRecentCrops = useCallback(async (limit?: number) => {
    return cropRepository.getRecent(limit);
  }, []);

  const getFavorites = useCallback(async () => {
    return cropRepository.getFavorites();
  }, []);

  return {
    crops: crops || [],
    isLoading,
    createCrop,
    updateCrop,
    deleteCrop,
    toggleFavorite,
    searchCrops,
    getRecentCrops,
    getFavorites,
  };
}
