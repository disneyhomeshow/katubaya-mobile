/**
 * Hook for managing crop categories
 */

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import { categoryRepository } from '@/data/repositories';
import type { CropCategory, CropCategoryType } from '@/domain/contracts/types';

export function useCategories() {
  const categories = useLiveQuery(() => categoryRepository.getAll(), []);
  const isLoading = categories === undefined;

  const createCategory = useCallback(async (
    data: Omit<CropCategory, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    return categoryRepository.create(data);
  }, []);

  const updateCategory = useCallback(async (
    id: string,
    data: Partial<Omit<CropCategory, 'id' | 'createdAt'>>
  ) => {
    return categoryRepository.update(id, data);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    return categoryRepository.delete(id);
  }, []);

  return {
    categories: categories || [],
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
