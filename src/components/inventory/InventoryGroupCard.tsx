/**
 * Inventory Group Card - Grouped display by crop/cultivar
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
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
  const { t, i18n } = useTranslation();
  const money = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'BRL' }),
    [i18n.language]
  );
  const [isOpen, setIsOpen] = useState(false);

  const displayName = item.cultivarName 
    ? `${item.cropName} - ${item.cultivarName}`
    : item.cropName;

  const unit = t(`units.${item.unit}`);
  const statusColors = getExpirationColor(item.expirationStatus);
  const hasMultipleLots = item.lots.length > 1;

  // Spans only: this header is rendered inside a <button>, which allows phrasing content only
  const header = (
    <span className="flex items-start gap-3">
      <span
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          statusColors.bg
        )}
        aria-hidden="true"
      >
        <Package className={cn('h-5 w-5', statusColors.text)} />
      </span>

      <span className="block min-w-0 flex-1 space-y-1">
        <span className="block font-medium truncate">{displayName}</span>
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground whitespace-nowrap">
            {item.totalQuantity} {unit}
          </span>
          {item.pricePerUnit ? (
            <span className="text-xs whitespace-nowrap">
              {money.format(item.pricePerUnit)}/{unit}
            </span>
          ) : null}
        </span>
        {item.totalValue ? (
          <span className="block text-xs text-primary font-medium">
            {t('inventory.totalValue')}: {money.format(item.totalValue)}
          </span>
        ) : null}
        <span className="flex flex-wrap items-center gap-2">
          <ExpirationBadge
            status={item.expirationStatus}
            daysRemaining={Math.min(...item.lots.map(l => l.daysUntilExpiry))}
          />
          {hasMultipleLots && (
            <Badge variant="secondary" className="whitespace-nowrap">
              {t('inventory.lotsCount', { count: item.lots.length })}
            </Badge>
          )}
        </span>
      </span>

      {hasMultipleLots && (
        isOpen ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 mt-2.5" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-2.5" aria-hidden="true" />
        )
      )}
    </span>
  );

  return (
    <Card className={cn(
      'transition-all',
      item.expirationStatus === 'expired' && 'border-harvest-expired/30',
      item.expirationStatus === 'expiring_soon' && 'border-harvest-warning/50'
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {hasMultipleLots ? (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {header}
            </button>
          </CollapsibleTrigger>
        ) : (
          <div className="p-4">{header}</div>
        )}

        {hasMultipleLots && (
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="space-y-2 border-t pt-3">
                {item.lots.map((lot, idx) => {
                  const lotStatusColors = getExpirationColor(lot.expirationStatus);
                  return (
                    <button
                      key={lot.lotId}
                      type="button"
                      onClick={() => onSelectLot(lot.lotId)}
                      className={cn(
                        'w-full flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg transition-colors',
                        'hover:bg-muted/50 text-left',
                        lotStatusColors.bg
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                        <span className="font-medium whitespace-nowrap">
                          {lot.quantityRemaining} {unit}
                        </span>
                      </span>
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
              type="button"
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
