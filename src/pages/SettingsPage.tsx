/**
 * Settings Page
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Smartphone, Loader2, Package, Archive, Monitor, Sun, Moon, MapPin, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
import { APP_VERSION, SCHEMA_VERSION } from '@/domain/contracts';
import type { Zone } from '@/domain/contracts/types';
import { db } from '@/data/db/schema';
import { settingsRepository } from '@/data/repositories';
import { useExport } from '@/hooks/useExport';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { exportData, isExporting } = useExport();
  const { theme, setTheme } = useTheme();
  const settings = useLiveQuery(() => settingsRepository.get(), []);
  const zones = useLiveQuery(() => db.zones.orderBy('sortOrder').toArray(), [], []);

  const [farmName, setFarmName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);

  useEffect(() => {
    if (settings) {
      setFarmName(settings.farmName ?? '');
      setContactInfo(settings.contactInfo ?? '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsRepository.update({ farmName: farmName.trim(), contactInfo: contactInfo.trim() });
      toast.success(t('settings.saved'));
    } catch {
      toast.error(t('errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = zoneName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    try {
      await db.zones.add({ id: crypto.randomUUID(), name, sortOrder: (zones.at(-1)?.sortOrder ?? -1) + 1, createdAt: now, updatedAt: now });
      setZoneName('');
      toast.success(t('settings.zoneAdded'));
    } catch {
      toast.error(t('errors.saveFailed'));
    }
  };

  const handleDeleteZone = async () => {
    if (!deletingZone) return;
    try {
      await db.zones.delete(deletingZone.id);
    } catch {
      toast.error(t('errors.saveFailed'));
    } finally {
      setDeletingZone(null);
    }
  };

  const handleExportAvailability = () => {
    exportData('availability');
  };

  const handleExportFull = () => {
    exportData('full');
  };

  return (
    <AppShell>
      <PageHeader title={t('settings.title')} showBack />

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* Farm Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.farmInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">{t('settings.farmName')}</Label>
                <Input
                  id="farmName"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder={t('settings.farmNamePlaceholder')}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">{t('settings.contact')}</Label>
                <Input
                  id="contact"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder={t('settings.contactPlaceholder')}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSaving || !settings}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
                {t('actions.save')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance: an explicit override of the system appearance, "system" by default */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.appearance')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label id="theme-label">{t('settings.theme')}</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={theme ?? 'system'}
              onValueChange={(value) => value && setTheme(value)}
              aria-labelledby="theme-label"
              className="grid grid-cols-3 gap-2"
            >
              {([
                ['system', Monitor],
                ['light', Sun],
                ['dark', Moon],
              ] as const).map(([value, Icon]) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:font-semibold"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {t(`settings.themes.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">{t('settings.themeHint')}</p>
          </CardContent>
        </Card>

        {/* Zones: shared by harvests and animal lots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.zones')}</CardTitle>
            <CardDescription>{t('settings.zonesHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {zones.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('settings.zonesEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {zones.map((zone) => (
                  <li key={zone.id} className="flex items-center gap-3 rounded-md bg-muted/50 pl-3 pr-1 min-h-11">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 truncate">{zone.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('settings.deleteZoneNamed', { name: zone.name })}
                      onClick={() => setDeletingZone(zone)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddZone} className="flex gap-2">
              <Label htmlFor="zoneName" className="sr-only">{t('settings.zoneName')}</Label>
              <Input
                id="zoneName"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder={t('settings.zoneNamePlaceholder')}
                aria-label={t('settings.zoneName')}
                enterKeyHint="done"
              />
              <Button type="submit" variant="outline" disabled={!zoneName.trim()}>
                {t('actions.addZone')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.dataManagement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 whitespace-normal"
              onClick={handleExportAvailability}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Package className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <div className="text-left">
                <p className="font-medium">{t('export.availabilityPack')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.exportDescription')}
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 whitespace-normal"
              onClick={handleExportFull}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Archive className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <div className="text-left">
                <p className="font-medium">{t('export.fullHistory')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.exportDescription')}
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.about')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">{t('settings.version')}</span>
              <Badge variant="secondary">{APP_VERSION}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">{t('settings.schema')}</span>
              <Badge variant="outline">{SCHEMA_VERSION}</Badge>
            </div>
            <Separator />
            <div className="flex items-center gap-2 py-2 text-muted-foreground">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">{t('settings.localData')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deletingZone} onOpenChange={(open) => !open && setDeletingZone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.deleteZone')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.deleteZoneDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={handleDeleteZone}>
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
