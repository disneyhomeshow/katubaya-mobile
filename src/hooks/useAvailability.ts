/**
 * Availability Hook - Manages availability state and operations
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { availabilityRepository, inventoryRepository, settingsRepository } from '@/data/repositories';
import type { AvailabilityList, AvailabilityItem, AvailabilityConfig } from '@/domain/contracts/types';
import { generateAvailabilityMessage } from '@/domain/rules/availability';

export function useAvailability() {
  // Live query for current availability
  const currentAvailability = useLiveQuery(
    () => availabilityRepository.getCurrent(),
    [],
    undefined
  );

  // Live query for config
  const config = useLiveQuery(
    () => availabilityRepository.getConfig(),
    [],
    undefined
  );

  // Generate new availability from current inventory
  const generateAvailability = async (): Promise<AvailabilityList> => {
    const snapshot = await inventoryRepository.generateSnapshot();
    const currentConfig = await availabilityRepository.getConfig();
    const settings = await settingsRepository.get();
    
    // Merge settings into config
    const mergedConfig = {
      ...currentConfig,
      farmName: settings?.farmName || currentConfig?.farmName,
      contactInfo: settings?.contactInfo || currentConfig?.contactInfo
    };
    
    return availabilityRepository.generateFromSnapshot(snapshot, mergedConfig as AvailabilityConfig);
  };

  // Update availability items
  const updateItems = async (id: string, items: AvailabilityItem[]): Promise<AvailabilityList | undefined> => {
    return availabilityRepository.update(id, { items });
  };

  // Toggle item inclusion
  const toggleItemInclusion = async (listId: string, itemId: string): Promise<AvailabilityList | undefined> => {
    const list = await availabilityRepository.getById(listId);
    if (!list) return undefined;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, isIncluded: !item.isIncluded } : item
    );

    return availabilityRepository.update(listId, { items: updatedItems });
  };

  // Update item quantity
  const updateItemQuantity = async (
    listId: string, 
    itemId: string, 
    quantity: number
  ): Promise<AvailabilityList | undefined> => {
    const list = await availabilityRepository.getById(listId);
    if (!list) return undefined;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );

    return availabilityRepository.update(listId, { items: updatedItems });
  };

  // Update list metadata
  const updateListMeta = async (
    listId: string,
    data: { headerText?: string; footerText?: string; windowName?: string }
  ): Promise<AvailabilityList | undefined> => {
    const list = await availabilityRepository.getById(listId);
    if (!list) return undefined;
    
    const updated = { ...list, ...data };
    updated.generatedMessage = generateAvailabilityMessage(updated);
    
    return availabilityRepository.update(listId, updated);
  };

  // Save config
  const saveConfig = async (configData: Partial<AvailabilityConfig>): Promise<AvailabilityConfig> => {
    const existing = await availabilityRepository.getConfig();
    return availabilityRepository.saveConfig({
      ...existing,
      ...configData
    } as Omit<AvailabilityConfig, 'id' | 'updatedAt'>);
  };

  // Copy message to clipboard
  const copyToClipboard = async (message: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  };

  return {
    currentAvailability,
    config,
    generateAvailability,
    updateItems,
    toggleItemInclusion,
    updateItemQuantity,
    updateListMeta,
    saveConfig,
    copyToClipboard
  };
}
