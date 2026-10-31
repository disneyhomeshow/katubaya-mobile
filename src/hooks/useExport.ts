/**
 * useExport Hook
 * Manages data export functionality
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { exportZip, downloadBlob, type ExportResult, type ExportType } from '@/data/services/exportService';

export type { ExportType };

export function useExport() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);

  const exportData = async (type: ExportType = 'full', farmName?: string) => {
    setIsExporting(true);
    
    try {
      const result = await exportZip(type, farmName);
      downloadBlob(result.blob, result.filename);
      setLastExport(result);

      toast.success(t('export.success'), {
        description: t('export.successDescription', {
          filename: result.filename,
          crops: result.stats.crops,
          harvests: result.stats.harvests
        })
      });

      return result;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('export.error'), { description: t('export.errorDescription') });
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
    lastExport
  };
}
