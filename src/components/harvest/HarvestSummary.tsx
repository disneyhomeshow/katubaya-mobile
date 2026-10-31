/**
 * Harvest Summary - Review before saving
 */

import { useTranslation } from 'react-i18next';
import { Wheat, Calendar, MapPin, FileText } from 'lucide-react';
import type { Crop, Cultivar, Zone, UnitType } from '@/domain/contracts/types';
import { format, parseISO } from 'date-fns';

interface HarvestSummaryProps {
  crop: Crop;
  cultivar?: Cultivar;
  quantity: number;
  unit: UnitType;
  zone?: Zone;
  harvestDate: string;
  notes?: string;
}

export function HarvestSummary({
  crop,
  cultivar,
  quantity,
  unit,
  zone,
  harvestDate,
  notes,
}: HarvestSummaryProps) {
  const { t } = useTranslation();
  // parseISO reads 'YYYY-MM-DD' as local midnight; new Date() would read it as UTC (previous day in UTC-3)
  const displayDate = format(parseISO(harvestDate), 'dd/MM/yyyy');

  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Main Summary Card */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Success Icon */}
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Wheat className="h-10 w-10 text-primary" />
        </div>

        {/* Crop Name */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">{crop.name}</h2>
          {cultivar && (
            <p className="text-muted-foreground">{cultivar.name}</p>
          )}
        </div>

        {/* Quantity Display */}
        <div className="text-center">
          <span className="text-5xl font-bold text-primary">{quantity}</span>
          <span className="text-2xl text-muted-foreground ml-2">
            {t(`units.${unit}`)}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 pt-6 border-t">
        <DetailRow
          icon={Calendar}
          label={t('harvest.date')}
          value={displayDate}
        />
        {zone && (
          <DetailRow
            icon={MapPin}
            label={t('harvest.zone')}
            value={zone.name}
          />
        )}
        {notes && (
          <DetailRow
            icon={FileText}
            label={t('harvest.notes')}
            value={notes}
          />
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
