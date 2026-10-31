/**
 * Animal lots ("lote de animais"): list, detail sheet, lot form and headcount adjustment
 */

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Beef,
  Bird,
  Bug,
  ChevronRight,
  Fish,
  Ham,
  Minus,
  PawPrint,
  Pencil,
  Plus,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { db } from '@/data/db/schema';
import { animalRepository, cropRepository } from '@/data/repositories';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AnimalGroup, AnimalAdjustmentReason, Crop, CropCategory, Species, Zone } from '@/domain/contracts/types';

const NONE = 'none';
const SPECIES: Species[] = ['cattle', 'poultry', 'swine', 'goat', 'sheep', 'bees', 'fish', 'other'];
const SPECIES_ICON: Record<Species, LucideIcon> = {
  cattle: Beef,
  poultry: Bird,
  swine: Ham,
  goat: PawPrint,
  sheep: PawPrint,
  bees: Bug,
  fish: Fish,
  other: PawPrint,
};
const REMOVE_REASONS: AnimalAdjustmentReason[] = ['death', 'sale', 'slaughter', 'correction'];
const ADD_REASONS: AnimalAdjustmentReason[] = ['birth', 'purchase', 'correction'];

// Local yyyy-mm-dd; toISOString() would roll to tomorrow after 21:00 in UTC-3
const localDate = (d = new Date()) => format(d, 'yyyy-MM-dd');

interface AnimalLotsProps {
  openNew: boolean;
  onOpenNewChange: (open: boolean) => void;
}

export function AnimalLots({ openNew, onOpenNewChange }: AnimalLotsProps) {
  const { t } = useTranslation();
  const groups = useLiveQuery(() => animalRepository.getAll(), []);
  const zones = useLiveQuery(() => db.zones.toArray(), [], [] as Zone[]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  // `group` stays set while the dialog animates out, so the title does not flip mid-fade
  const [form, setForm] = useState<{ open: boolean; group: AnimalGroup | null }>({ open: false, group: null });
  const [adjust, setAdjust] = useState<{ open: boolean; group: AnimalGroup | null }>({ open: false, group: null });
  const [deleting, setDeleting] = useState<AnimalGroup | null>(null);

  useEffect(() => {
    if (openNew) setForm({ open: true, group: null });
  }, [openNew]);

  const zoneName = (id?: string) => zones.find((z) => z.id === id)?.name;
  const selected = groups?.find((g) => g.id === selectedId) ?? null;

  const closeForm = () => {
    setForm((f) => ({ ...f, open: false }));
    onOpenNewChange(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await animalRepository.remove(deleting.id);
      setSelectedId(null);
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  return (
    <>
      {!groups ? (
        <div className="space-y-3" aria-busy="true">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-16 bg-muted/50" />
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
            <p className="font-medium">{t('animals.empty')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('animals.emptyHint')}</p>
            <Button className="mt-4" onClick={() => onOpenNewChange(true)}>
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('animals.newLot')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => {
            const Icon = SPECIES_ICON[group.species];
            const zone = zoneName(group.zoneId);
            return (
              <Card key={group.id} className="hover:bg-muted/50 transition-colors">
                <button
                  type="button"
                  onClick={() => setSelectedId(group.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <div
                    className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('animals.headcount', { count: group.headcount })}
                      {zone && ` • ${zone}`}
                    </p>
                  </div>
                  {group.headcount === 0 && (
                    <Badge variant="secondary" className="shrink-0">{t('animals.closed')}</Badge>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <LotDetailSheet
        group={selected}
        zoneName={zoneName(selected?.zoneId)}
        onClose={() => setSelectedId(null)}
        onEdit={(g) => { setSelectedId(null); setForm({ open: true, group: g }); }}
        onAdjust={(g) => { setSelectedId(null); setAdjust({ open: true, group: g }); }}
        onDelete={setDeleting}
      />

      <LotFormDialog
        open={form.open}
        onOpenChange={(open) => !open && closeForm()}
        group={form.group}
        zones={zones}
      />

      <AdjustDialog
        open={adjust.open}
        onOpenChange={(open) => !open && setAdjust((a) => ({ ...a, open: false }))}
        group={adjust.group}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('animals.deleteLot')}</AlertDialogTitle>
            <AlertDialogDescription>{t('animals.deleteLotDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={handleDelete}>
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Detail sheet
// ---------------------------------------------------------------------------

interface LotDetailSheetProps {
  group: AnimalGroup | null;
  zoneName?: string;
  onClose: () => void;
  onEdit: (group: AnimalGroup) => void;
  onAdjust: (group: AnimalGroup) => void;
  onDelete: (group: AnimalGroup) => void;
}

function LotDetailSheet({ group, zoneName, onClose, onEdit, onAdjust, onDelete }: LotDetailSheetProps) {
  const { t } = useTranslation();
  // Keep the last lot so the Drawer can animate out after `group` becomes null
  const last = useRef<{ group: AnimalGroup; zoneName?: string } | null>(null);
  if (group) last.current = { group, zoneName };
  const shown = group ?? last.current?.group;
  const shownZone = group ? zoneName : last.current?.zoneName;
  const history = useLiveQuery(() => animalRepository.getAdjustments(shown?.id ?? ''), [shown?.id], []);

  if (!shown) return null;
  const Icon = SPECIES_ICON[shown.species];

  return (
    <Drawer open={!!group} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85dvh]">
        <DrawerHeader className="text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="h-14 w-14 shrink-0 rounded-full bg-muted flex items-center justify-center"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <DrawerTitle className="flex items-center gap-2">
                  <span className="truncate">{shown.name}</span>
                  {shown.headcount === 0 && (
                    <Badge variant="secondary" className="shrink-0">{t('animals.closed')}</Badge>
                  )}
                </DrawerTitle>
                <DrawerDescription>
                  {t(`animals.speciesNames.${shown.species}`)}
                  {shownZone && ` • ${shownZone}`}
                </DrawerDescription>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button variant="outline" size="icon" aria-label={t('actions.edit')} onClick={() => onEdit(shown)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive"
                aria-label={t('actions.delete')}
                onClick={() => onDelete(shown)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label={t('actions.close')}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-[calc(1rem+var(--safe-area-bottom))]">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{t('animals.headcount')}</p>
                <p className="text-3xl font-bold">{shown.headcount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{t('animals.startedAt')}</p>
                <p className="font-medium">{format(new Date(shown.startedAt), 'dd/MM/yyyy')}</p>
              </CardContent>
            </Card>
          </div>

          {shown.notes && (
            <div>
              <h3 className="text-sm font-medium mb-2">{t('animals.notes')}</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{shown.notes}</p>
            </div>
          )}

          <Button className="w-full" onClick={() => onAdjust(shown)}>
            {t('animals.adjust')}
          </Button>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">{t('animals.history')}</h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('animals.noHistory')}</p>
            ) : (
              <ul className="space-y-2">
                {history.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm">
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {format(new Date(a.adjustedAt), 'dd/MM')}
                    </span>
                    <span className="min-w-0 flex-1">
                      {t(`animals.reasons.${a.reason}`)}
                      {a.notes && <span className="text-muted-foreground"> · {a.notes}</span>}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {a.delta > 0 ? '+' : '−'}{Math.abs(a.delta)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// Create / edit form
// ---------------------------------------------------------------------------

interface LotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AnimalGroup | null;
  zones: Zone[];
}

function LotFormDialog({ open, onOpenChange, group, zones }: LotFormDialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const today = localDate();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('cattle');
  const [headcount, setHeadcount] = useState('');
  const [zoneId, setZoneId] = useState(NONE);
  const [startedAt, setStartedAt] = useState(today);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fill from the lot being edited (or clear) each time the dialog opens
  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? '');
    setSpecies(group?.species ?? 'cattle');
    setHeadcount('');
    setZoneId(group?.zoneId ?? NONE);
    setStartedAt(group ? localDate(new Date(group.startedAt)) : localDate());
    setNotes(group?.notes ?? '');
    setSubmitted(false);
  }, [open, group]);

  const nameError = submitted && !name.trim();
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(startedAt) && startedAt <= today;
  const headOk = group ? true : /^\d+$/.test(headcount);
  const headError = submitted && !headOk;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!name.trim() || !validDate || !headOk) return;
    setIsSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        species,
        zoneId: zoneId === NONE ? undefined : zoneId,
        startedAt: new Date(`${startedAt}T12:00:00`).toISOString(),
        notes: notes.trim() || undefined,
      };
      if (group) {
        await animalRepository.update(group.id, data);
        toast.success(t('animals.updated'));
      } else {
        await animalRepository.create({ ...data, headcount: Number(headcount) });
        toast.success(t('animals.created'));
      }
      onOpenChange(false);
    } catch {
      toast.error(t('errors.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{group ? t('animals.editLot') : t('animals.newLot')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>{t('animals.name')}</Label>
            <Input
              id={`${id}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('animals.namePlaceholder')}
              aria-invalid={nameError || undefined}
              aria-describedby={`${id}-name-error`}
            />
            <p id={`${id}-name-error`} aria-live="polite" className="text-sm text-destructive">
              {nameError && t('errors.required')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-species`}>{t('animals.species')}</Label>
            <Select value={species} onValueChange={(v) => setSpecies(v as Species)}>
              <SelectTrigger id={`${id}-species`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPECIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`animals.speciesNames.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!group && (
            <div className="space-y-2">
              <Label htmlFor={`${id}-headcount`}>{t('animals.initialHeadcount')}</Label>
              <Input
                id={`${id}-headcount`}
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                placeholder="0"
                aria-invalid={headError || undefined}
                aria-describedby={`${id}-headcount-error`}
              />
              <p id={`${id}-headcount-error`} aria-live="polite" className="text-sm text-destructive">
                {headError && t('errors.invalidQuantity')}
              </p>
            </div>
          )}

          {zones.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={`${id}-zone`}>{t('animals.zone')}</Label>
              <Select value={zoneId} onValueChange={setZoneId}>
                <SelectTrigger id={`${id}-zone`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t('animals.noZone')}</SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`${id}-date`}>{t('animals.startedAt')}</Label>
            <Input
              id={`${id}-date`}
              type="date"
              max={today}
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              aria-invalid={!validDate || undefined}
              aria-describedby={`${id}-date-error`}
            />
            <p id={`${id}-date-error`} aria-live="polite" className="text-sm text-destructive">
              {!validDate && t('errors.futureDate')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-notes`}>{t('animals.notes')}</Label>
            <Textarea
              id={`${id}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('animals.notesPlaceholder')}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !validDate}>
            {t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Headcount adjustment (mirrors inventory/AdjustmentDialog)
// ---------------------------------------------------------------------------

interface AdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AnimalGroup | null;
}

function AdjustDialog({ open, onOpenChange, group }: AdjustDialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const allCrops = useLiveQuery(() => cropRepository.getAll(), [], [] as Crop[]);
  const categories = useLiveQuery(() => db.categories.toArray(), [], [] as CropCategory[]);
  const animalCategoryIds = new Set(categories.filter((c) => c.type === 'animal').map((c) => c.id));
  const crops = allCrops.filter((c) => animalCategoryIds.has(c.categoryId));
  const [count, setCount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [reason, setReason] = useState<AnimalAdjustmentReason>('death');
  const [notes, setNotes] = useState('');
  const [productId, setProductId] = useState(NONE);
  const [outputQty, setOutputQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxRemove = group?.headcount ?? 0;
  const n = /^\d+$/.test(count) ? Number(count) : NaN;
  const hasCount = n > 0;
  const overMax = !isAdding && hasCount && n > maxRemove;
  const isSlaughter = !isAdding && reason === 'slaughter';
  const product = isSlaughter ? crops.find((c) => c.id === productId) : undefined;
  const outQty = parseFloat(outputQty);
  const hasOutQty = !isNaN(outQty) && outQty > 0;
  const canSave = hasCount && !overMax && (!product || hasOutQty) && !isSubmitting;
  const reasons = isAdding ? ADD_REASONS : REMOVE_REASONS;

  const resetForm = () => {
    setCount('');
    setIsAdding(false);
    setReason('death');
    setNotes('');
    setProductId(NONE);
    setOutputQty('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const toggle = (adding: boolean) => {
    setIsAdding(adding);
    setReason(adding ? 'birth' : 'death');
  };

  const handleSubmit = async () => {
    if (!group || !canSave) return;
    setIsSubmitting(true);
    try {
      await animalRepository.adjust({
        groupId: group.id,
        delta: isAdding ? n : -n,
        reason,
        notes: notes || undefined,
        output: product
          ? { cropId: product.id, quantity: outQty, unit: product.defaultUnit, notes: notes || undefined }
          : undefined,
      });
      toast.success(t('animals.adjusted'));
      handleOpenChange(false);
    } catch {
      toast.error(t('errors.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t('animals.adjustTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="font-medium">{group.name}</p>
            <p className="text-sm text-muted-foreground">
              {t('animals.currentHeadcount')}: {group.headcount}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={!isAdding ? 'default' : 'outline'}
              className="flex-1"
              aria-pressed={!isAdding}
              onClick={() => toggle(false)}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
              {t('actions.remove')}
            </Button>
            <Button
              type="button"
              variant={isAdding ? 'default' : 'outline'}
              className="flex-1"
              aria-pressed={isAdding}
              onClick={() => toggle(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('actions.add')}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-count`}>{t('animals.headcount')}</Label>
            <Input
              id={`${id}-count`}
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              max={!isAdding ? maxRemove : undefined}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="0"
              className="text-lg"
              aria-invalid={overMax || undefined}
              aria-describedby={!isAdding ? `${id}-count-hint` : undefined}
            />
            {!isAdding && (
              <p
                id={`${id}-count-hint`}
                aria-live="polite"
                className={overMax ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}
              >
                {overMax
                  ? t('animals.exceedsHeadcount', { max: maxRemove })
                  : t('animals.maxRemove', { max: maxRemove })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-reason`}>{t('inventory.adjustReason')}</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as AnimalAdjustmentReason)}>
              <SelectTrigger id={`${id}-reason`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`animals.reasons.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSlaughter && (
            <div className="space-y-4 rounded-lg border p-3">
              <p className="text-sm font-medium">{t('animals.slaughterOutput')}</p>
              <div className="space-y-2">
                <Label htmlFor={`${id}-product`}>{t('animals.outputProduct')}</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id={`${id}-product`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t('animals.noOutput')}</SelectItem>
                    {crops.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {product && (
                <div className="space-y-2">
                  <Label htmlFor={`${id}-output-qty`}>
                    {t('animals.outputQuantity')} ({t(`units.${product.defaultUnit}`)})
                  </Label>
                  <Input
                    id={`${id}-output-qty`}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    value={outputQty}
                    onChange={(e) => setOutputQty(e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`${id}-notes`}>{t('animals.notes')}</Label>
            <Textarea
              id={`${id}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('animals.notesPlaceholder')}
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
