/**
 * Inventory Adjust Page - Select lot and adjust quantity
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Package, AlertTriangle } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdjustmentDialog, type ProcessingOutput } from '@/components/inventory/AdjustmentDialog';
import { ExpirationBadge } from '@/components/inventory/ExpirationBadge';
import { db } from '@/data/db/schema';
import { lotRepository, harvestRepository } from '@/data/repositories';
import { useInventory } from '@/hooks/useInventory';
import { getExpirationStatus, getDaysUntilExpiry } from '@/domain/rules/expiration';
import type { Lot, Crop, Cultivar } from '@/domain/contracts/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LotWithDetails {
  lot: Lot;
  crop?: Crop;
  cultivar?: Cultivar;
}

export default function InventoryAdjustPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adjustLot } = useInventory();

  const [selectedLot, setSelectedLot] = useState<LotWithDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get all active lots with crop details, grouped by crop id
  const lotsWithDetails = useLiveQuery(async () => {
    const lots = await lotRepository.getActive();
    const crops = await db.crops.toArray();
    const cultivars = await db.cultivars.toArray();

    const cropsMap = new Map(crops.map(c => [c.id, c]));
    const cultivarsMap = new Map(cultivars.map(c => [c.id, c]));

    const grouped = lots.reduce((acc, lot) => {
      const crop = cropsMap.get(lot.cropId);
      const cultivar = lot.cultivarId ? cultivarsMap.get(lot.cultivarId) : undefined;
      
      if (!acc[lot.cropId]) {
        acc[lot.cropId] = {
          crop,
          lots: []
        };
      }
      
      acc[lot.cropId].lots.push({ lot, crop, cultivar });
      return acc;
    }, {} as Record<string, { crop?: Crop; lots: LotWithDetails[] }>);

    return Object.entries(grouped);
  }, [], []);

  const handleSelectLot = (lotWithDetails: LotWithDetails) => {
    setSelectedLot(lotWithDetails);
    setDialogOpen(true);
  };

  const handleAdjust = async (
    delta: number,
    reason: Parameters<typeof adjustLot>[2],
    notes?: string,
    output?: ProcessingOutput
  ) => {
    if (!selectedLot) return;

    if (output) {
      await harvestRepository.createFromProcessing(
        { cropId: selectedLot.lot.cropId, unit: selectedLot.lot.unit, quantity: Math.abs(delta) },
        { ...output, notes }
      );
      toast.success(t('inventory.processed'));
      return;
    }

    await adjustLot(selectedLot.lot.id, delta, reason, notes);
    
    toast.success(t('inventory.adjusted'), {
      description: delta < 0 ? t('inventory.reasons.' + reason) : t('inventory.reasons.correction'),
    });
  };

  const isEmpty = !lotsWithDetails || lotsWithDetails.length === 0;

  return (
    <AppShell showNav={false}>
      <PageHeader
        title={t('actions.adjustInventory')}
        showBack
      />

      <div className="flex-1 overflow-auto p-4 max-w-lg mx-auto w-full">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4" aria-hidden="true">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">{t('inventory.empty')}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t('inventory.startHarvesting')}
            </p>
            <Button type="button" onClick={() => navigate('/harvest/new')}>
              {t('actions.logHarvest')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('inventory.selectLotToAdjust')}
            </p>
            
            {lotsWithDetails?.map(([cropId, group]) => (
              <Card key={cropId}>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                    {group.crop?.name || t('inventory.unknownCrop')}
                  </h3>
                  
                  <div className="space-y-2">
                    {group.lots.map(({ lot, crop, cultivar }) => {
                      const status = getExpirationStatus(lot.expiresAtEstimate);
                      const daysLeft = getDaysUntilExpiry(lot.expiresAtEstimate);
                      
                      return (
                        <button
                          key={lot.id}
                          type="button"
                          onClick={() => handleSelectLot({ lot, crop, cultivar })}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 p-3 rounded-lg text-left transition-colors',
                            'bg-muted/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            status === 'expired' && 'border border-harvest-expired/30',
                            status === 'expiring_soon' && 'border border-harvest-warning/30'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              {cultivar && (
                                <span className="text-sm text-muted-foreground truncate min-w-0 max-w-full">
                                  {cultivar.name}
                                </span>
                              )}
                              <span className="font-medium whitespace-nowrap">
                                {lot.quantityRemaining} {t(`units.${lot.unit}`)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <ExpirationBadge 
                                status={status} 
                                daysRemaining={daysLeft} 
                              />
                            </div>
                          </div>
                          
                          {status === 'expiring_soon' && (
                            <AlertTriangle className="h-4 w-4 text-harvest-warning shrink-0" aria-hidden="true" />
                          )}
                          {status === 'expired' && (
                            <AlertTriangle className="h-4 w-4 text-harvest-expired shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedLot && (
        <AdjustmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          lot={selectedLot.lot}
          crop={selectedLot.crop}
          cultivar={selectedLot.cultivar}
          onAdjust={handleAdjust}
        />
      )}
    </AppShell>
  );
}
