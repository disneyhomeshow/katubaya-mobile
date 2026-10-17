/**
 * Harvest Wizard Page - 3-step fast harvest logging
 * Target: < 30 seconds to log a harvest
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHarvests } from '@/hooks/useHarvests';
import { db } from '@/data/db/schema';
import { cropRepository } from '@/data/repositories';
import {
  CropSelector,
  QuantityInput,
  ContextInput,
} from '@/components/harvest';
import type { Crop, Cultivar, Zone, UnitType } from '@/domain/contracts/types';

type WizardStep = 'crop' | 'quantity' | 'context';

const STEPS: WizardStep[] = ['crop', 'quantity', 'context'];

export default function HarvestWizardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    recentCrops,
    favoriteCrops,
    allCrops,
    createHarvest,
    searchCrops,
    getCultivarsForCrop,
  } = useHarvests();

  // Check for pre-fill params (duplicate mode)
  const prefillCropId = searchParams.get('cropId');
  const prefillCultivarId = searchParams.get('cultivarId');
  const prefillUnit = searchParams.get('unit') as UnitType | null;

  // Wizard state
  const [step, setStep] = useState<WizardStep>(prefillCropId ? 'quantity' : 'crop');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(!prefillCropId);

  // Form state
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedCultivar, setSelectedCultivar] = useState<Cultivar | undefined>();
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState<UnitType>(prefillUnit || 'kg');
  const [zoneId, setZoneId] = useState<string | undefined>();
  // Local calendar date; toISOString() would give the UTC date (tomorrow after 21:00 in UTC-3)
  const [harvestDate, setHarvestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  // Handle pre-fill from duplicate
  useEffect(() => {
    if (prefillCropId && !isInitialized) {
      cropRepository.getById(prefillCropId).then((crop) => {
        if (crop) {
          setSelectedCrop(crop);
          if (prefillUnit) setUnit(prefillUnit);
          
          // Load cultivars and select if prefilled
          getCultivarsForCrop(crop.id).then((cvs) => {
            setCultivars(cvs);
            if (prefillCultivarId) {
              const cv = cvs.find(c => c.id === prefillCultivarId);
              if (cv) setSelectedCultivar(cv);
            }
          });
        }
        setIsInitialized(true);
      });
    }
  }, [prefillCropId, prefillCultivarId, prefillUnit, isInitialized, getCultivarsForCrop]);

  // Load zones
  const zones = useLiveQuery(() => db.zones.toArray(), [], []);

  // Load cultivars when crop is selected
  useEffect(() => {
    if (selectedCrop) {
      getCultivarsForCrop(selectedCrop.id).then(setCultivars);
    }
  }, [selectedCrop, getCultivarsForCrop]);

  const handleCropSelect = useCallback((crop: Crop) => {
    setSelectedCrop(crop);
    setSelectedCultivar(undefined);
    setUnit(crop.defaultUnit);
    setStep('quantity');
  }, []);

  const handleCultivarChange = useCallback((cultivarId?: string) => {
    if (cultivarId) {
      const found = cultivars.find((c) => c.id === cultivarId);
      setSelectedCultivar(found);
    } else {
      setSelectedCultivar(undefined);
    }
  }, [cultivars]);

  const handleBack = useCallback(() => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    } else {
      navigate(-1);
    }
  }, [step, navigate]);

  const handleNext = useCallback(() => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    }
  }, [step]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 'crop':
        return selectedCrop !== null;
      case 'quantity':
        return quantity > 0;
      case 'context':
        return /^\d{4}-\d{2}-\d{2}$/.test(harvestDate) && harvestDate <= new Date().toLocaleDateString('en-CA');
      default:
        return false;
    }
  }, [step, selectedCrop, quantity, harvestDate]);

  const handleSubmit = useCallback(async () => {
    if (!selectedCrop || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await createHarvest({
        cropId: selectedCrop.id,
        cultivarId: selectedCultivar?.id,
        zoneId,
        quantity,
        unit,
        // 'YYYY-MM-DD' alone parses as UTC midnight = previous evening in Brazil; pin to local noon
        harvestedAt: new Date(`${harvestDate}T12:00:00`).toISOString(),
        notes: notes.trim() || undefined,
      });

      toast.success(t('harvest.success'), {
        description: `${quantity} ${t(`units.${unit}`)} ${selectedCrop.name}`,
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to create harvest:', error);
      toast.error(t('errors.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedCrop,
    selectedCultivar,
    zoneId,
    quantity,
    unit,
    harvestDate,
    notes,
    createHarvest,
    navigate,
    t,
  ]);

  const stepIndex = STEPS.indexOf(step);
  const isLastStep = step === 'context';

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 pt-[calc(0.75rem+var(--safe-area-top))] border-b shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
          aria-label={t('actions.back')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">{t('harvest.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t(`harvest.step${step.charAt(0).toUpperCase() + step.slice(1)}`)}
          </p>
        </div>
        {/* Step Indicators */}
        <div className="flex gap-1.5">
          <span className="sr-only" aria-live="polite">
            {t('harvest.stepOf', { current: stepIndex + 1, total: STEPS.length })}
          </span>
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-2 w-8 rounded-full transition-colors',
                i <= stepIndex ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {step === 'crop' && (
          <CropSelector
            recentCrops={recentCrops}
            favoriteCrops={favoriteCrops}
            allCrops={allCrops}
            onSelect={handleCropSelect}
            onSearch={searchCrops}
          />
        )}

        {step === 'quantity' && selectedCrop && (
          <QuantityInput
            crop={selectedCrop}
            cultivar={selectedCultivar}
            cultivars={cultivars}
            quantity={quantity}
            unit={unit}
            onQuantityChange={setQuantity}
            onUnitChange={setUnit}
            onCultivarChange={handleCultivarChange}
          />
        )}

        {step === 'context' && selectedCrop && (
          <ContextInput
            zones={zones}
            zoneId={zoneId}
            harvestDate={harvestDate}
            notes={notes}
            onZoneChange={setZoneId}
            onDateChange={setHarvestDate}
            onNotesChange={setNotes}
          />
        )}
      </main>

      {/* Footer with Action Button */}
      {step !== 'crop' && (
        <footer className="px-4 pt-4 pb-[calc(1rem+var(--safe-area-bottom))] border-t shrink-0 bg-background">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold"
            disabled={!canProceed() || isSubmitting}
            aria-busy={isSubmitting}
            onClick={isLastStep ? handleSubmit : handleNext}
          >
            {isSubmitting ? (
              <span className="animate-pulse">{t('harvest.saving')}</span>
            ) : isLastStep ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                {t('actions.done')}
              </>
            ) : (
              t('actions.next')
            )}
          </Button>
        </footer>
      )}
    </div>
  );
}
