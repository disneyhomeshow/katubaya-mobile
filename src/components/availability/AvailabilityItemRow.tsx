/**
 * Availability Item Row - Editable item in availability list
 */

import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AvailabilityItem } from '@/domain/contracts/types';
import { getCropEmoji } from '@/domain/rules/availability';

interface AvailabilityItemRowProps {
  item: AvailabilityItem;
  onToggleInclude: () => void;
  onQuantityChange: (quantity: number) => void;
}

export function AvailabilityItemRow({
  item,
  onToggleInclude,
  onQuantityChange
}: AvailabilityItemRowProps) {
  const { t } = useTranslation();
  
  const emoji = getCropEmoji(item.cropName);
  const displayName = item.cultivarName 
    ? `${item.cropName} (${item.cultivarName})`
    : item.cropName;

  const handleIncrement = () => {
    onQuantityChange(item.quantity + 0.5);
  };

  const handleDecrement = () => {
    if (item.quantity > 0.5) {
      onQuantityChange(item.quantity - 0.5);
    }
  };

  return (
    <div
      role="group"
      aria-label={displayName}
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2 p-3 rounded-lg border transition-all',
        item.isIncluded
          ? 'bg-card border-border'
          : 'bg-muted/30 border-muted'
      )}
    >
      {/* Include toggle */}
      <Switch
        checked={item.isIncluded}
        onCheckedChange={onToggleInclude}
        aria-label={`${t('availability.include')}: ${displayName}`}
        className="shrink-0"
      />

      {/* Item info */}
      <div className="flex items-center gap-2 flex-1 min-w-[8rem]">
        <span className="text-xl shrink-0" aria-hidden="true">{emoji}</span>
        <span className={cn(
          'font-medium truncate',
          !item.isIncluded && 'line-through'
        )}>
          {displayName}
        </span>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <Button
          variant="outline"
          size="icon"
          aria-label={t('actions.decrease')}
          onClick={handleDecrement}
          disabled={!item.isIncluded || item.quantity <= 0.5}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          inputMode="decimal"
          aria-label={t('harvest.quantity')}
          value={item.quantity}
          onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 0)}
          className="w-16 text-center"
          disabled={!item.isIncluded}
          step="0.5"
          min="0"
        />
        
        <Button
          variant="outline"
          size="icon"
          aria-label={t('actions.increase')}
          onClick={handleIncrement}
          disabled={!item.isIncluded}
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <span className="text-sm text-muted-foreground w-10">
          {t(`units.${item.unit}`)}
        </span>
      </div>
    </div>
  );
}
