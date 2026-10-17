/**
 * Cultures Page - CRUD for categories, crops, and cultivars
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Leaf, ChevronRight, Star, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { badgeVariants } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCategories, useCrops } from '@/hooks';
import { CropFormDialog } from '@/components/cultures/CropFormDialog';
import { CropDetailSheet } from '@/components/cultures/CropDetailSheet';
import { CategoryBadge } from '@/components/cultures/CategoryBadge';
import type { Crop } from '@/domain/contracts/types';
import { cn } from '@/lib/utils';

export default function CulturesPage() {
  const { t } = useTranslation();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { crops, isLoading: cropsLoading, toggleFavorite, deleteCrop } = useCrops();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cropFormOpen, setCropFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [deletingCrop, setDeletingCrop] = useState<Crop | null>(null);

  // ?new=1 opens the new-crop form (FAB deep link), then clears the param
  useEffect(() => {
    if (!categoriesLoading && searchParams.get('new') === '1') {
      setEditingCrop(null);
      setCropFormOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [categoriesLoading, searchParams, setSearchParams]);

  // Group crops by category
  const cropsByCategory = crops.reduce((acc, crop) => {
    if (!acc[crop.categoryId]) {
      acc[crop.categoryId] = [];
    }
    acc[crop.categoryId].push(crop);
    return acc;
  }, {} as Record<string, Crop[]>);

  // Filter crops if category selected
  const displayedCrops = selectedCategory
    ? crops.filter(c => c.categoryId === selectedCategory)
    : crops;

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setCropFormOpen(true);
  };

  const handleNewCrop = () => {
    setEditingCrop(null);
    setCropFormOpen(true);
  };

  const isLoading = categoriesLoading || cropsLoading;

  return (
    <AppShell>
      <PageHeader
        title={t('crops.title')}
        showBack
        rightContent={
          <Button size="sm" onClick={handleNewCrop}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('crops.addCrop')}
          </Button>
        }
      />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            type="button"
            aria-pressed={selectedCategory === null}
            className={cn(
              badgeVariants({ variant: selectedCategory === null ? 'default' : 'outline' }),
              'shrink-0 py-1.5 px-3'
            )}
            onClick={() => setSelectedCategory(null)}
          >
            {t('crops.all')} ({crops.length})
          </button>
          {categories.map((category) => (
            <CategoryBadge
              key={category.id}
              category={category}
              count={cropsByCategory[category.id]?.length || 0}
              isSelected={selectedCategory === category.id}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
            />
          ))}
        </div>

        {/* Crops List */}
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-16 bg-muted/50" />
              </Card>
            ))}
          </div>
        ) : displayedCrops.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">{t('crops.empty')}</p>
              <Button className="mt-4" onClick={handleNewCrop}>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('crops.addCrop')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {displayedCrops.map((crop) => {
              const category = categories.find(c => c.id === crop.categoryId);
              return (
                <Card
                  key={crop.id}
                  className="flex items-center hover:bg-muted/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div
                      className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: category?.color
                          ? `color-mix(in srgb, ${category.color} 15%, transparent)`
                          : undefined,
                      }}
                      aria-hidden="true"
                    >
                      {category?.icon ?? <Leaf className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{crop.name}</span>
                        {crop.isFavorite && (
                          <>
                            <Star className="h-4 w-4 shrink-0 fill-primary text-primary" aria-hidden="true" />
                            <span className="sr-only">{t('crops.favorite')}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t(`units.${crop.defaultUnit}`)} • {t('crops.shelfLifeDays', { count: crop.shelfLifeDaysDefault })}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </button>

                  <div className="flex items-center gap-1 pr-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={t('actions.more')}>
                          <MoreVertical className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover z-50">
                        <DropdownMenuItem onClick={() => toggleFavorite(crop.id)}>
                          <Star className="h-4 w-4 mr-2" aria-hidden="true" />
                          {crop.isFavorite ? t('actions.unfavorite') : t('actions.favorite')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCrop(crop)}>
                          <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
                          {t('actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingCrop(crop)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                          {t('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Crop Form Dialog */}
      <CropFormDialog
        open={cropFormOpen}
        onOpenChange={setCropFormOpen}
        crop={editingCrop}
        categories={categories}
      />

      {/* Crop Detail Sheet */}
      <CropDetailSheet
        crop={selectedCrop}
        category={categories.find(c => c.id === selectedCrop?.categoryId)}
        onClose={() => setSelectedCrop(null)}
        onEdit={(c) => { setSelectedCrop(null); handleEditCrop(c); }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingCrop} onOpenChange={(open) => !open && setDeletingCrop(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('crops.deleteCrop')}</AlertDialogTitle>
            <AlertDialogDescription>{t('crops.deleteCropDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={() => deletingCrop && deleteCrop(deletingCrop.id)}
            >
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
