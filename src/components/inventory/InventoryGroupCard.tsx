/**
 * Inventory Group Card - Grouped display by crop/cultivar
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExpirationBadge } from './ExpirationBadge';
import type { InventorySnapshotItem } from '@/domain/contracts/types';
import { getExpirationColor } from '@/domain/rules/expiration';

interface InventoryGroupCardProps {
  item: InventorySnapshotItem;
  onSelectLot: (lotId: string) => void;
}

export function InventoryGroupCard({ item, onSelectLot }: InventoryGroupCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const displayName = item.cultivarName 
    ? `${item.cropName} - ${item.cultivarName}`
    : item.cropName;

  const statusColors = getExpirationColor(item.expirationStatus);
  const hasMultipleLots = item.lots.length > 1;

  return (
    <Card className={cn(
      'transition-all',
      item.expirationStatus === 'expired' && 'opacity-70 border-harvest-expired/30',
      item.expirationStatus === 'expiring_soon' && 'border-harvest-warning/50'
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                  statusColors.bg
                )}>
                  <Package className={cn('h-5 w-5', statusColors.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{displayName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {item.totalQuantity} {item.unit}
                    </span>
                    {item.pricePerUnit && (
                      <span className="text-xs">
                        R$ {item.pricePerUnit.toFixed(2)}/{item.unit}
                      </span>
                    )}
                    {hasMultipleLots && (
                      <Badge variant="secondary" className="text-xs">
                        {item.lots.length} lotes
                      </Badge>
                    )}
                  </div>
                  {item.totalValue && (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {t('inventory.totalValue')}: R$ {item.totalValue.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ExpirationBadge
                  status={item.expirationStatus}
                  daysRemaining={Math.min(...item.lots.map(l => l.daysUntilExpiry))}
                />
                {hasMultipleLots && (
                  isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {hasMultipleLots && (
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="space-y-2 border-t pt-3">
                {item.lots.map((lot, idx) => {
                  const lotStatusColors = getExpirationColor(lot.expirationStatus);
                  return (
                    <button
                      key={lot.lotId}
                      onClick={() => onSelectLot(lot.lotId)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                        'hover:bg-muted/50 text-left',
                        lotStatusColors.bg
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                        <span className="font-medium">
                          {lot.quantityRemaining} {item.unit}
                        </span>
                      </div>
                      <ExpirationBadge
                        status={lot.expirationStatus}
                        daysRemaining={lot.daysUntilExpiry}
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        )}

        {!hasMultipleLots && item.lots.length === 1 && (
          <CardContent className="pt-0 pb-4 px-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onSelectLot(item.lots[0].lotId)}
            >
              {t('inventory.adjust')}
            </Button>
          </CardContent>
        )}
      </Collapsible>
    </Card>
  );
}
