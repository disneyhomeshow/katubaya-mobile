/**
 * Adjustment Dialog - Manual inventory adjustment
 */

import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cropRepository, lotRepository } from '@/data/repositories';
import { InsufficientStockError } from '@/domain/rules/processing';
import type { Lot, AdjustmentReason, Crop, Cultivar, UnitType } from '@/domain/contracts/types';

/** Reason 'processing': what the consumed stock became (leite → queijo) */
export interface ProcessingOutput {
  cropId: string;
  quantity: number;
  unit: UnitType;
}

interface AdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot: Lot;
  crop?: Crop;
  cultivar?: Cultivar;
  onAdjust: (
    delta: number,
    reason: AdjustmentReason,
    notes?: string,
    output?: ProcessingOutput
  ) => Promise<void>;
}

const ADJUSTMENT_REASONS: AdjustmentReason[] = [
  'sold',
  'consumed',
  'damage',
  'loss',
  'gift',
  'correction',
  'processing'
];

export function AdjustmentDialog({
  open,
  onOpenChange,
  lot,
  crop,
  cultivar,
  onAdjust
}: AdjustmentDialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const [quantity, setQuantity] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [reason, setReason] = useState<AdjustmentReason>('sold');
  const [notes, setNotes] = useState('');
  const [outputCropId, setOutputCropId] = useState('');
  const [outputQuantity, setOutputQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Processing only removes; the add list hides it and the toggle resets it
  const isProcessing = !isAdding && reason === 'processing';
  const reasons = isAdding ? ADJUSTMENT_REASONS.filter((r) => r !== 'processing') : ADJUSTMENT_REASONS;

  // Processing consumes the whole product FIFO, so its ceiling is the crop total, not this lot
  const cropLots = useLiveQuery(() => lotRepository.getByCrop(lot.cropId), [lot.cropId], [] as Lot[]);
  const crops = useLiveQuery(() => cropRepository.getAll(), [], [] as Crop[]);
  // Same unit only (the repository applies the same filter); rounded so 0.1+0.2 never shows as 0.30000000000000004
  const cropTotal = Number(cropLots.filter((l) => l.unit === lot.unit).reduce((sum, l) => sum + l.quantityRemaining, 0).toFixed(3));
  const outputCrop = crops.find((c) => c.id === outputCropId);

  const unit = t(`units.${lot.unit}`);
  const maxRemove = isProcessing ? cropTotal : lot.quantityRemaining;
  const qty = parseFloat(quantity);
  const hasQty = !isNaN(qty) && qty > 0;
  const overMax = !isAdding && hasQty && qty > maxRemove;
  const outQty = parseFloat(outputQuantity);
  const hasOutput = !!outputCrop && !isNaN(outQty) && outQty > 0;
  const canSave = hasQty && !overMax && (!isProcessing || hasOutput) && !isSubmitting;

  const resetForm = () => {
    setQuantity('');
    setIsAdding(false);
    setReason('sold');
    setNotes('');
    setOutputCropId('');
    setOutputQuantity('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleAddMode = () => {
    setIsAdding(true);
    if (reason === 'processing') setReason('sold');
  };

  const handleSubmit = async () => {
    if (!canSave) return;

    setIsSubmitting(true);
    try {
      const delta = isAdding ? qty : -qty;
      const output = isProcessing && outputCrop
        ? { cropId: outputCrop.id, quantity: outQty, unit: outputCrop.defaultUnit }
        : undefined;
      await onAdjust(delta, reason, notes || undefined, output);
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof InsufficientStockError
          ? t('inventory.exceedsAvailable', { max: cropTotal, unit })
          : t('errors.saveFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const cropName = crop?.name ?? t('inventory.unknownCrop');
  const displayName = cultivar ? `${cropName} - ${cultivar.name}` : cropName;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('inventory.adjustTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              {t('inventory.currentQuantity')}: {isProcessing ? cropTotal : lot.quantityRemaining} {unit}
            </p>
          </div>

          {/* Add/Remove toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!isAdding ? 'default' : 'outline'}
              className="flex-1"
              aria-pressed={!isAdding}
              onClick={() => setIsAdding(false)}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
              {t('actions.remove')}
            </Button>
            <Button
              type="button"
              variant={isAdding ? 'default' : 'outline'}
              className="flex-1"
              aria-pressed={isAdding}
              onClick={handleAddMode}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('actions.add')}
            </Button>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor={`${id}-quantity`}>{t('harvest.quantity')} ({unit})</Label>
            <Input
              id={`${id}-quantity`}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max={!isAdding ? maxRemove : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="text-lg"
              aria-invalid={overMax || undefined}
              aria-describedby={!isAdding ? `${id}-quantity-hint` : undefined}
            />
            {!isAdding && (
              <p
                id={`${id}-quantity-hint`}
                aria-live="polite"
                className={overMax ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}
              >
                {overMax
                  ? t('inventory.exceedsAvailable', { max: maxRemove, unit })
                  : isProcessing
                    ? t('inventory.processing.fifoHint', { max: maxRemove, unit })
                    : t('inventory.maxRemove', { max: maxRemove, unit })}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor={`${id}-reason`}>{t('inventory.adjustReason')}</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as AdjustmentReason)}>
              <SelectTrigger id={`${id}-reason`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`inventory.reasons.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Processing output */}
          {isProcessing && (
            <>
              <div className="space-y-2">
                <Label htmlFor={`${id}-output-crop`}>{t('inventory.processing.outputProduct')}</Label>
                <Select value={outputCropId} onValueChange={setOutputCropId}>
                  <SelectTrigger id={`${id}-output-crop`}>
                    <SelectValue placeholder={t('inventory.processing.selectProduct')} />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-output-quantity`}>
                  {t('inventory.processing.outputQuantity')}
                  {outputCrop && ` (${t(`units.${outputCrop.defaultUnit}`)})`}
                </Label>
                <Input
                  id={`${id}-output-quantity`}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  required
                  value={outputQuantity}
                  onChange={(e) => setOutputQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor={`${id}-notes`}>{t('harvest.notes')}</Label>
            <Textarea
              id={`${id}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('harvest.notesPlaceholder')}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSave}>
            {t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
