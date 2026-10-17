/**
 * Cultivar Form Dialog - Create/Edit cultivars
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCultivars } from '@/hooks';
import { toast } from 'sonner';
import type { Cultivar } from '@/domain/contracts/types';

const cultivarFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  shelfLifeDaysOverride: z.number().min(1).max(365).optional().nullable(),
  useOverride: z.boolean(),
  notes: z.string().max(500).optional(),
});

type CultivarFormValues = z.infer<typeof cultivarFormSchema>;

interface CultivarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cultivar: Cultivar | null;
  cropId: string;
  defaultShelfLife: number;
}

export function CultivarFormDialog({ 
  open, 
  onOpenChange, 
  cultivar, 
  cropId,
  defaultShelfLife 
}: CultivarFormDialogProps) {
  const { t } = useTranslation();
  const { createCultivar, updateCultivar } = useCultivars(cropId);

  const form = useForm<CultivarFormValues>({
    resolver: zodResolver(cultivarFormSchema),
    defaultValues: {
      name: '',
      shelfLifeDaysOverride: defaultShelfLife,
      useOverride: false,
      notes: '',
    },
  });

  const useOverride = form.watch('useOverride');

  // Reset form when cultivar changes
  useEffect(() => {
    if (cultivar) {
      form.reset({
        name: cultivar.name,
        shelfLifeDaysOverride: cultivar.shelfLifeDaysOverride || defaultShelfLife,
        useOverride: !!cultivar.shelfLifeDaysOverride,
        notes: cultivar.notes || '',
      });
    } else {
      form.reset({
        name: '',
        shelfLifeDaysOverride: defaultShelfLife,
        useOverride: false,
        notes: '',
      });
    }
  }, [cultivar, defaultShelfLife, form]);

  const onSubmit = async (data: CultivarFormValues) => {
    try {
      const payload = {
        cropId,
        name: data.name,
        shelfLifeDaysOverride: data.useOverride ? data.shelfLifeDaysOverride ?? undefined : undefined,
        notes: data.notes || undefined,
      };

      if (cultivar) {
        await updateCultivar(cultivar.id, payload);
        toast.success('Variedade atualizada!');
      } else {
        await createCultivar(payload);
        toast.success('Variedade criada!');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro', { description: 'Não foi possível salvar a variedade' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {cultivar ? 'Editar Variedade' : 'Nova Variedade'}
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
                    <Input placeholder="Ex: Prata, Nanica..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useOverride"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="cursor-pointer">Validade personalizada</FormLabel>
                    <FormDescription className="text-xs">
                      Padrão da cultura: {defaultShelfLife} dias
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {useOverride && (
              <FormField
                control={form.control}
                name="shelfLifeDaysOverride"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade (dias)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={365}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(parseInt(e.target.value) || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas sobre a variedade..."
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
