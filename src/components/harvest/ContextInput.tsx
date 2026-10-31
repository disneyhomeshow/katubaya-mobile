/**
 * Context Input Step - Optional zone, animal lot, date, and notes
 */

import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, FileText, PawPrint } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Zone, AnimalGroup } from '@/domain/contracts/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Radix Select rejects value="" on items; sentinel for "no zone" / "no animal lot"
const NONE = 'none';

interface ContextInputProps {
  zones: Zone[];
  zoneId?: string;
  animalGroups: AnimalGroup[];
  animalGroupId?: string;
  /** Only when the selected crop's category is 'animal' */
  showAnimalLot: boolean;
  harvestDate: string;
  notes: string;
  onZoneChange: (zoneId?: string) => void;
  onAnimalGroupChange: (id?: string) => void;
  onDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
}

export function ContextInput({
  zones,
  zoneId,
  animalGroups,
  animalGroupId,
  showAnimalLot,
  harvestDate,
  notes,
  onZoneChange,
  onAnimalGroupChange,
  onDateChange,
  onNotesChange,
}: ContextInputProps) {
  const { t } = useTranslation();
  // Local yyyy-mm-dd; toISOString() would roll to tomorrow after 21:00 in UTC-3
  const today = new Date().toLocaleDateString('en-CA');
  const openGroups = animalGroups.filter((g) => g.headcount > 0);

  return (
    <div className="flex flex-col h-full px-4 py-6 space-y-6 overflow-y-auto">
      {/* Date Input */}
      <div className="space-y-2">
        <Label htmlFor="harvest-date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('harvest.date')}
        </Label>
        <Input
          id="harvest-date"
          type="date"
          required
          max={today}
          value={harvestDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="h-12"
        />
      </div>

      {/* Zone Selection */}
      {zones.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="harvest-zone" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t('harvest.zone')}
          </Label>
          <Select
            value={zoneId ?? NONE}
            onValueChange={(val) => onZoneChange(val === NONE ? undefined : val)}
          >
            <SelectTrigger id="harvest-zone" className="h-12">
              <SelectValue placeholder={t('harvest.zone')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{t('harvest.noZone')}</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Animal lot (milking, egg collection, slaughter) */}
      {showAnimalLot && openGroups.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="harvest-animal-lot" className="flex items-center gap-2">
            <PawPrint className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t('harvest.animalLot')}
          </Label>
          <Select
            value={animalGroupId ?? NONE}
            onValueChange={(val) => onAnimalGroupChange(val === NONE ? undefined : val)}
          >
            <SelectTrigger id="harvest-animal-lot" className="h-12">
              <SelectValue placeholder={t('harvest.animalLot')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{t('harvest.noAnimalLot')}</SelectItem>
              {openGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2 flex-1">
        <Label htmlFor="harvest-notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('harvest.notes')}
        </Label>
        <Textarea
          id="harvest-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t('harvest.notesPlaceholder')}
          className="min-h-[120px] resize-none"
        />
      </div>
    </div>
  );
}
