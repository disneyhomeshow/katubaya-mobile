/**
 * Lot Card - Individual lot display with expiration and actions
 */

import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, Calendar, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpirationBadge } from './ExpirationBadge';
import type { Lot, ExpirationStatus } from '@/domain/contracts/types';

interface LotCardProps {
  lot: Lot;
  cropName: string;
  cultivarName?: string;
  expirationStatus: ExpirationStatus;
  daysUntilExpiry: number;
  onAdjust: () => void;
}

export function LotCard({
  lot,
  cropName,
  cultivarName,
  expirationStatus,
  daysUntilExpiry,
  onAdjust
}: LotCardProps) {
  const { t } = useTranslation();

  const displayName = cultivarName 
    ? `${cropName} - ${cultivarName}`
    : cropName;

  const harvestDate = format(new Date(lot.harvestedAt), "dd MMM", { locale: ptBR });

  return (
    <Card className={cn(
      'transition-all',
      expirationStatus === 'expired' && 'border-harvest-expired/30',
      expirationStatus === 'expiring_soon' && 'border-harvest-warning/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <h3 className="font-medium truncate">{displayName}</h3>
            </div>

            {/* Quantity */}
            <p className="text-2xl font-bold text-primary mb-2">
              {lot.quantityRemaining}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {t(`units.${lot.unit}`)}
              </span>
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>{t('inventory.harvestedOn', { date: harvestDate })}</span>
              </div>
              <ExpirationBadge 
                status={expirationStatus}
                daysRemaining={daysUntilExpiry}
              />
            </div>

            {/* Notes */}
            {lot.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                {lot.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onAdjust}
            className="shrink-0"
            aria-label={t('inventory.adjust')}
          >
            <Edit2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
