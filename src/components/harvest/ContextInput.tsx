/**
 * Context Input Step - Optional zone, date, and notes
 */

import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Zone } from '@/domain/contracts/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Radix Select rejects value="" on items; sentinel for "no zone"
const NONE = 'none';

interface ContextInputProps {
  zones: Zone[];
  zoneId?: string;
  harvestDate: string;
  notes: string;
  onZoneChange: (zoneId?: string) => void;
  onDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
}

export function ContextInput({
  zones,
  zoneId,
  harvestDate,
  notes,
  onZoneChange,
  onDateChange,
  onNotesChange,
}: ContextInputProps) {
  const { t } = useTranslation();
  // Local yyyy-mm-dd; toISOString() would roll to tomorrow after 21:00 in UTC-3
  const today = new Date().toLocaleDateString('en-CA');

  return (
    <div className="flex flex-col h-full px-4 py-6 space-y-6 overflow-y-auto">
      {/* Date Input */}
      <div className="space-y-2">
        <Label htmlFor="harvest-date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
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
            <MapPin className="h-4 w-4 text-muted-foreground" />
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

      {/* Notes */}
      <div className="space-y-2 flex-1">
        <Label htmlFor="harvest-notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
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
