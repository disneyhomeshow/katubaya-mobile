/**
 * Crop Form Dialog - Create/Edit crops
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCrops } from '@/hooks';
import { toast } from 'sonner';
import type { Crop, CropCategory, UnitType } from '@/domain/contracts/types';

const UNIT_OPTIONS: UnitType[] = ['kg', 'g', 'unit', 'bunch', 'liter', 'ml', 'box', 'bag'];

const cropFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  defaultUnit: z.enum(['kg', 'g', 'unit', 'bunch', 'liter', 'ml', 'box', 'bag']),
  shelfLifeDaysDefault: z.number().min(1).max(365),
  pricePerUnit: z.number().min(0).optional(),
  isFavorite: z.boolean(),
  notes: z.string().max(500).optional(),
});

type CropFormValues = z.infer<typeof cropFormSchema>;

interface CropFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crop: Crop | null;
  categories: CropCategory[];
}

export function CropFormDialog({ open, onOpenChange, crop, categories }: CropFormDialogProps) {
  const { t } = useTranslation();
  const { createCrop, updateCrop } = useCrops();

  const form = useForm<CropFormValues>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      name: '',
      categoryId: categories[0]?.id || '',
      defaultUnit: 'kg',
      shelfLifeDaysDefault: 7,
      pricePerUnit: undefined,
      isFavorite: false,
      notes: '',
    },
  });

  // Reset form when crop changes
  useEffect(() => {
    if (crop) {
      form.reset({
        name: crop.name,
        categoryId: crop.categoryId,
        defaultUnit: crop.defaultUnit,
        shelfLifeDaysDefault: crop.shelfLifeDaysDefault,
        pricePerUnit: crop.pricePerUnit,
        isFavorite: crop.isFavorite,
        notes: crop.notes || '',
      });
    } else {
      form.reset({
        name: '',
        categoryId: categories[0]?.id || '',
        defaultUnit: 'kg',
        shelfLifeDaysDefault: 7,
        pricePerUnit: undefined,
        isFavorite: false,
        notes: '',
      });
    }
  }, [crop, categories, form]);

  const onSubmit = async (data: CropFormValues) => {
    try {
      if (crop) {
        await updateCrop(crop.id, {
          name: data.name,
          categoryId: data.categoryId,
          defaultUnit: data.defaultUnit,
          shelfLifeDaysDefault: data.shelfLifeDaysDefault,
          pricePerUnit: data.pricePerUnit,
          isFavorite: data.isFavorite,
          notes: data.notes,
        });
        toast.success('Cultura atualizada!');
      } else {
        await createCrop({
          name: data.name,
          categoryId: data.categoryId,
          defaultUnit: data.defaultUnit,
          shelfLifeDaysDefault: data.shelfLifeDaysDefault,
          pricePerUnit: data.pricePerUnit,
          isFavorite: data.isFavorite,
          notes: data.notes,
        });
        toast.success('Cultura criada!');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro', { description: 'Não foi possível salvar a cultura' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {crop ? 'Editar Cultura' : 'Nova Cultura'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('crops.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Banana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('crops.category')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover z-50">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="defaultUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('crops.defaultUnit')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover z-50">
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {t(`units.${unit}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shelfLifeDaysDefault"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('crops.shelfLife')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={365}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('crops.price')} (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      min={0}
                      placeholder={t('crops.pricePlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : parseFloat(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">Favorito</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas sobre a cultura..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
