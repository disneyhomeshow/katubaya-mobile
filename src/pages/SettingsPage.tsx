/**
 * Settings Page
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Smartphone, Loader2, Package, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { APP_VERSION, SCHEMA_VERSION } from '@/domain/contracts';
import { settingsRepository } from '@/data/repositories';
import { useExport } from '@/hooks/useExport';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { exportData, isExporting } = useExport();
  const settings = useLiveQuery(() => settingsRepository.get(), []);

  const [farmName, setFarmName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    </AppShell>
  );
}
