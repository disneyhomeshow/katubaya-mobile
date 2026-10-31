/**
 * Crop Detail Sheet - View crop details and cultivars
 */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Pencil, Plus, Trash2, Clock, Package, Leaf, X } from 'lucide-react';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCultivars, useCrops } from '@/hooks';
import { CultivarFormDialog } from './CultivarFormDialog';
import type { Crop, CropCategory, Cultivar } from '@/domain/contracts/types';

interface CropDetailSheetProps {
  crop: Crop | null;
  category: CropCategory | undefined;
  onClose: () => void;
  onEdit: (crop: Crop) => void;
}

export function CropDetailSheet({ crop, category, onClose, onEdit }: CropDetailSheetProps) {
  const { t } = useTranslation();
  const { toggleFavorite } = useCrops();
  // Keep the last crop so the Drawer can animate out after `crop` becomes null
  const last = useRef<{ crop: Crop; category?: CropCategory } | null>(null);
  if (crop) last.current = { crop, category };
  const shown = crop ?? last.current?.crop;
  const shownCategory = crop ? category : last.current?.category;
  const { cultivars, deleteCultivar } = useCultivars(shown?.id);

  const [cultivarFormOpen, setCultivarFormOpen] = useState(false);
  const [editingCultivar, setEditingCultivar] = useState<Cultivar | null>(null);
  const [deletingCultivar, setDeletingCultivar] = useState<Cultivar | null>(null);

  if (!shown) return null;

  const handleAddCultivar = () => {
    setEditingCultivar(null);
    setCultivarFormOpen(true);
  };

  const handleEditCultivar = (cultivar: Cultivar) => {
    setEditingCultivar(cultivar);
    setCultivarFormOpen(true);
  };

  return (
    <>
      <Drawer open={!!crop} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader className="text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="h-14 w-14 shrink-0 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: shownCategory?.color
                      ? `color-mix(in srgb, ${shownCategory.color} 15%, transparent)`
                      : undefined,
                  }}
                  aria-hidden="true"
                >
                  {shownCategory?.icon ?? <Leaf className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <DrawerTitle className="flex items-center gap-2">
                    {shown.name}
                    {shown.isFavorite && (
                      <Star className="h-5 w-5 shrink-0 fill-primary text-primary" aria-hidden="true" />
                    )}
                  </DrawerTitle>
                  <DrawerDescription>{shownCategory?.name ?? t('crops.title')}</DrawerDescription>
                </div>
              </div>
              <div className="flex shrink-0 gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('crops.favorite')}
                  aria-pressed={shown.isFavorite}
                  onClick={() => toggleFavorite(shown.id)}
                >
                  <Star className={shown.isFavorite ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4'} aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('actions.edit')}
                  onClick={() => onEdit(shown)}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
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
            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('crops.unit')}</p>
                    <p className="font-medium">{t(`units.${shown.defaultUnit}`)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('crops.shelfLifeLabel')}</p>
                    <p className="font-medium">{t('crops.shelfLifeDays', { count: shown.shelfLifeDaysDefault })}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {shown.notes && (
              <div>
                <h3 className="text-sm font-medium mb-2">{t('crops.notes')}</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {shown.notes}
                </p>
              </div>
            )}

            <Separator />

            {/* Cultivars */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{t('crops.cultivars')}</h3>
                <Button size="sm" variant="outline" onClick={handleAddCultivar}>
                  <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                  {t('crops.addCultivar')}
                </Button>
              </div>

              {cultivars.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <p>{t('crops.noCultivars')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {cultivars.map((cultivar) => (
                    <Card key={cultivar.id}>
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{cultivar.name}</p>
                          {cultivar.shelfLifeDaysOverride && (
                            <p className="text-xs text-muted-foreground">
                              {`${t('crops.shelfLifeLabel')}: ${t('crops.shelfLifeDays', { count: cultivar.shelfLifeDaysOverride })}`}
                            </p>
                          )}
                          {cultivar.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {cultivar.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('actions.edit')}
                            onClick={() => handleEditCultivar(cultivar)}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            aria-label={t('actions.delete')}
                            onClick={() => setDeletingCultivar(cultivar)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Cultivar Form Dialog */}
      <CultivarFormDialog
        open={cultivarFormOpen}
        onOpenChange={setCultivarFormOpen}
        cultivar={editingCultivar}
        cropId={shown.id}
        defaultShelfLife={shown.shelfLifeDaysDefault}
      />

      {/* Delete cultivar confirmation */}
      <AlertDialog open={!!deletingCultivar} onOpenChange={(open) => !open && setDeletingCultivar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('crops.deleteCultivar')}</AlertDialogTitle>
            <AlertDialogDescription>{t('crops.deleteCultivarDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={() => deletingCultivar && deleteCultivar(deletingCultivar.id)}
            >
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
