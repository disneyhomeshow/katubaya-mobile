/**
 * Availability Page - Generate and copy WhatsApp availability message
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings2, Package, RefreshCw, ListChecks } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AvailabilityItemRow, 
  MessagePreview, 
  ConfigDialog 
} from '@/components/availability';
import { useAvailability } from '@/hooks/useAvailability';
import { toast } from 'sonner';
import type { AvailabilityList } from '@/domain/contracts/types';

export default function AvailabilityPage() {
  const { t } = useTranslation();
  const {
    currentAvailability,
    config,
    generateAvailability,
    toggleItemInclusion,
    updateItemQuantity,
    saveConfig,
    copyToClipboard
  } = useAvailability();

  const [availability, setAvailability] = useState<AvailabilityList | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  // Load current availability on mount
  useEffect(() => {
    if (currentAvailability) {
      setAvailability(currentAvailability);
    }
  }, [currentAvailability]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newList = await generateAvailability();
      setAvailability(newList);
      toast.success(t('availability.title'), { description: 'Lista gerada com sucesso!' });
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!availability?.generatedMessage) return;
    
    const success = await copyToClipboard(availability.generatedMessage);
    if (success) {
      toast.success(t('availability.copied'), { description: 'Cole no WhatsApp para enviar' });
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!availability) return;
    const updated = await toggleItemInclusion(availability.id, itemId);
    if (updated) setAvailability(updated);
  };

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (!availability) return;
    const updated = await updateItemQuantity(availability.id, itemId, quantity);
    if (updated) setAvailability(updated);
  };

  const handleSaveConfig = async (configData: Parameters<typeof saveConfig>[0]) => {
    await saveConfig(configData);
    // Regenerate to apply new config
    await handleGenerate();
  };

  const hasItems = availability && availability.items.length > 0;
  const includedCount = availability?.items.filter(i => i.isIncluded).length ?? 0;

  return (
    <AppShell>
      <PageHeader
        title={t('availability.title')}
        rightContent={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfigDialogOpen(true)}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        }
      />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Generate button / status */}
        {!hasItems && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('availability.noItems')}</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Gere uma lista a partir do seu estoque atual
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t('availability.generate')}
              </Button>
            </CardContent>
          </Card>
        )}

        {hasItems && (
          <>
            {/* Tabs for Preview / Edit */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview" className="gap-2">
                  📱 {t('availability.preview')}
                </TabsTrigger>
                <TabsTrigger value="edit" className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  {t('availability.editItems')} ({includedCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <MessagePreview
                  message={availability?.generatedMessage ?? ''}
                  isStale={availability?.isStale}
                  onCopy={handleCopy}
                  onRegenerate={handleGenerate}
                  isRegenerating={isGenerating}
                />
              </TabsContent>

              <TabsContent value="edit" className="mt-4 space-y-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{t('availability.editItems')}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {includedCount} de {availability?.items.length ?? 0} itens
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {availability?.items.map((item) => (
                      <AvailabilityItemRow
                        key={item.id}
                        item={item}
                        onToggleInclude={() => handleToggleItem(item.id)}
                        onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
                      />
                    ))}
                  </CardContent>
                </Card>

                {/* Copy button in edit view too */}
                <Button 
                  onClick={handleCopy} 
                  className="w-full"
                  disabled={includedCount === 0}
                >
                  {t('availability.copyMessage')}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Window name display */}
            <div className="text-center text-sm text-muted-foreground">
              📅 {availability?.windowName || t('availability.thisWeek')}
            </div>
          </>
        )}
      </div>

      {/* Config Dialog */}
      <ConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        config={config}
        onSave={handleSaveConfig}
      />
    </AppShell>
  );
}
