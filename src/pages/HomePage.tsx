/**
 * Home Page - Dashboard with availability and quick actions
 */

import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, Wheat, AlertTriangle, RotateCcw, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpirationBadge } from '@/components/inventory/ExpirationBadge';
import { useCrops, useHarvests, useInventory } from '@/hooks';
import { useAvailability } from '@/hooks/useAvailability';
import { getExpirationStatus, getDaysUntilExpiry, getExpirationColor } from '@/domain/rules/expiration';
import type { HarvestEvent } from '@/domain/contracts/types';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { crops } = useCrops();
  const { recentHarvests, allCrops } = useHarvests();
  const { lots, expiringLots } = useInventory();
  const { currentAvailability, copyToClipboard } = useAvailability();

  const handleDuplicate = (harvest: HarvestEvent) => {
    // Navigate to harvest wizard with pre-fill params
    const params = new URLSearchParams({
      cropId: harvest.cropId,
      ...(harvest.cultivarId && { cultivarId: harvest.cultivarId }),
      unit: harvest.unit,
    });
    navigate(`/harvest/new?${params.toString()}`);
  };

  const handleCopy = async () => {
    if (!currentAvailability?.generatedMessage) return;
    const ok = await copyToClipboard(currentAvailability.generatedMessage);
    if (ok) {
      toast.success(t('availability.copied'), { description: t('availability.pasteHint') });
    } else {
      toast.error(t('availability.copyFailed'));
    }
  };

  const getCropName = (cropId: string) => {
    return allCrops.find(c => c.id === cropId)?.name || t('inventory.unknownCrop');
  };

  return (
    <AppShell>
      <PageHeader
        title={t('app.name')}
        subtitle={t('app.tagline')}
        showSettings
      />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Current Availability Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
                {t('home.currentAvailability')}
              </CardTitle>
              {currentAvailability ? (
                currentAvailability.isStale ? (
                  <Badge variant="outline" className="bg-harvest-warning/10 text-harvest-warning border-harvest-warning">
                    {t('home.stale')}
                  </Badge>
                ) : (
                  <Badge variant="outline">{t('home.upToDate')}</Badge>
                )
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  {t('home.noAvailability')}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {currentAvailability
                ? t('home.generatedOn', { date: format(new Date(currentAvailability.createdAt), 'dd/MM HH:mm') })
                : t('home.generateFirst')}
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => navigate('/availability')}>
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                {currentAvailability ? t('actions.regenerate') : t('actions.generate')}
              </Button>
              {currentAvailability && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label={t('availability.copyMessage')}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Harvests */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wheat className="h-5 w-5" aria-hidden="true" />
                {t('home.recentHarvests')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentHarvests.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Wheat className="h-10 w-10 mx-auto mb-2 opacity-50" aria-hidden="true" />
                <p>{t('home.noHarvests')}</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => navigate('/harvest/new')}
                >
                  {t('actions.logHarvest')}
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentHarvests.slice(0, 5).map((harvest) => (
                  <li
                    key={harvest.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {getCropName(harvest.cropId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {harvest.quantity} {t(`units.${harvest.unit}`)} • {format(new Date(harvest.harvestedAt), 'dd/MM')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(harvest)}
                      className="shrink-0 ml-2"
                      title={t('harvest.duplicate')}
                      aria-label={t('harvest.duplicate')}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-harvest-warning" aria-hidden="true" />
                {t('home.expiringSoon')}
              </CardTitle>
              {expiringLots.length > 0 && (
                <Badge variant="outline" className="bg-harvest-warning/10 text-harvest-warning border-harvest-warning">
                  {expiringLots.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {expiringLots.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>{t('home.noExpiring')}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {expiringLots.slice(0, 3).map((lot) => {
                  const status = getExpirationStatus(lot.expiresAtEstimate);
                  return (
                    <li
                      key={lot.id}
                      className={`flex items-center justify-between gap-2 p-3 rounded-lg ${getExpirationColor(status).bg}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {getCropName(lot.cropId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lot.quantityRemaining} {t(`units.${lot.unit}`)}
                        </p>
                      </div>
                      <ExpirationBadge
                        status={status}
                        daysRemaining={getDaysUntilExpiry(lot.expiresAtEstimate)}
                        className="shrink-0"
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-lg border bg-card text-card-foreground shadow-sm w-full p-4 text-center hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/cultures')}
          >
            <span className="block text-3xl font-bold text-primary">{crops.length}</span>
            <span className="block text-sm text-muted-foreground">{t('crops.title')}</span>
          </button>
          <button
            type="button"
            className="rounded-lg border bg-card text-card-foreground shadow-sm w-full p-4 text-center hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/inventory')}
          >
            <span className="block text-3xl font-bold text-primary">{lots.length}</span>
            <span className="block text-sm text-muted-foreground">{t('home.lotsInStock')}</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
