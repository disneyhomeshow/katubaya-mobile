/**
 * Quantity Input Step - Fast entry with quick-add buttons
 */

import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Crop, Cultivar, UnitType } from '@/domain/contracts/types';

const UNITS: UnitType[] = ['kg', 'g', 'unit', 'dozen', 'bunch', 'liter', 'ml', 'box', 'bag'];
// Radix Select rejects value="" on items; sentinel for "no cultivar"
const NONE = 'none';

interface QuantityInputProps {
  crop: Crop;
  cultivar?: Cultivar;
  cultivars: Cultivar[];
  quantity: number;
  unit: UnitType;
  onQuantityChange: (quantity: number) => void;
  onUnitChange: (unit: UnitType) => void;
  onCultivarChange: (cultivarId?: string) => void;
}

export function QuantityInput({
  crop,
  cultivar,
  cultivars,
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
  onCultivarChange,
}: QuantityInputProps) {
  const { t, i18n } = useTranslation();

  const handleQuickAdd = (amount: number) => {
    const newValue = Math.max(0, quantity + amount);
    onQuantityChange(Number(newValue.toFixed(2)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onQuantityChange(value);
    } else if (e.target.value === '') {
      onQuantityChange(0);
    }
  };

  return (
    <div className="flex flex-col h-full px-4 py-6 space-y-6 overflow-y-auto">
      {/* Crop Display */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">{crop.name}</h2>
        {cultivar && (
          <p className="text-muted-foreground">{cultivar.name}</p>
        )}
      </div>

      {/* Cultivar Selection (if available) */}
      {cultivars.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="harvest-cultivar" className="text-muted-foreground">
            {t('crops.cultivars')}
          </Label>
          <Select
            value={cultivar?.id ?? NONE}
            onValueChange={(val) => onCultivarChange(val === NONE ? undefined : val)}
          >
            <SelectTrigger id="harvest-cultivar">
              <SelectValue placeholder={t('crops.cultivars')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{t('harvest.noCultivar')}</SelectItem>
              {cultivars.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main Quantity Display */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Large Quantity Display */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => handleQuickAdd(-1)}
            disabled={quantity <= 0}
            aria-label={t('actions.decrease')}
          >
            <Minus className="h-6 w-6" />
          </Button>

          <div className="flex items-baseline gap-2">
            <Input
              type="number"
              inputMode="decimal"
              aria-label={t('harvest.quantity')}
              value={quantity || ''}
              onChange={handleInputChange}
              className={cn(
                'w-28 h-20 text-center text-4xl font-bold border-0 bg-transparent',
                'focus-visible:ring-0 focus-visible:ring-offset-0',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              )}
              placeholder="0"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => handleQuickAdd(1)}
            aria-label={t('actions.increase')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Unit Selector */}
        <Select value={unit} onValueChange={(val) => onUnitChange(val as UnitType)}>
          <SelectTrigger className="w-32" aria-label={t('harvest.unit')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u} value={u}>
                {t(`units.${u}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick-Add Buttons */}
      <div className="flex justify-center gap-3">
        {[0.5, 1, 5, 10].map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="lg"
            className="px-6 rounded-full"
            onClick={() => handleQuickAdd(amount)}
          >
            +{amount.toLocaleString(i18n.language)}
          </Button>
        ))}
      </div>
    </div>
  );
}
