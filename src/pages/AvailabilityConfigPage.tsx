/**
 * Availability Config Page - Configure WhatsApp message settings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAvailability } from '@/hooks/useAvailability';
import { availabilityRepository } from '@/data/repositories';
import { toast } from 'sonner';

export default function AvailabilityConfigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { config, saveConfig } = useAvailability();

  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing config
  useEffect(() => {
    if (config) {
      setHeaderText(config.defaultHeaderText || '');
      setFooterText(config.defaultFooterText || '');
    }
  }, [config]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveConfig({
        defaultHeaderText: headerText || undefined,
        defaultFooterText: footerText || undefined
      });
      await availabilityRepository.markCurrentAsStale();
      toast.success(t('availability.configSaved'));
      navigate('/availability', { replace: true });
    } catch {
      toast.error(t('errors.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={t('actions.configureAvailability')}
        showBack
      />

      <div className="p-4 max-w-lg mx-auto space-y-4 pb-28">
        {/* Farm info lives in Settings — single source of truth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('settings.farmInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('availability.configFarmInfoDesc')}</p>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              {t('nav.settings')}
            </Button>
          </CardContent>
        </Card>

        {/* Message Customization Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('availability.configMessage')}</CardTitle>
            <CardDescription>{t('availability.configMessageDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headerText">{t('availability.headerText')}</Label>
              <Textarea
                id="headerText"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder={t('availability.headerPlaceholder')}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {t('availability.headerTextHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText">{t('availability.footerText')}</Label>
              <Textarea
                id="footerText"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder={t('availability.footerPlaceholder')}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {t('availability.footerTextHint')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview hint */}
        <div className="text-center text-sm text-muted-foreground">
          {t('availability.configPreviewHint')}
        </div>

        {/* Save Button - Fixed at bottom */}
        <div className="fixed bottom-[calc(4rem+var(--safe-area-bottom))] left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
          <div className="max-w-lg mx-auto">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              <Check className="h-4 w-4 mr-2" />
              {t('actions.save')}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
