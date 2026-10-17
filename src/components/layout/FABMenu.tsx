/**
 * Floating Action Button with quick-actions drawer
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wheat, PackageMinus, Leaf, Settings2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export function FABMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: Wheat,
      label: t('actions.logHarvest'),
      description: t('actions.logHarvestDesc'),
      onClick: () => navigate('/harvest/new'),
      primary: true,
    },
    {
      icon: PackageMinus,
      label: t('actions.adjustInventory'),
      description: t('actions.adjustInventoryDesc'),
      onClick: () => navigate('/inventory/adjust'),
    },
    {
      icon: Leaf,
      label: t('actions.addCrop'),
      description: t('actions.addCropDesc'),
      onClick: () => navigate('/cultures?new=1'),
    },
    {
      icon: Settings2,
      label: t('actions.configureAvailability'),
      description: t('actions.configureAvailabilityDesc'),
      onClick: () => navigate('/availability/config'),
    },
  ];

  const handleAction = (action: typeof actions[0]) => {
    setOpen(false);
    action.onClick();
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          aria-label={t('actions.openQuickActions')}
          aria-expanded={open}
          className="h-14 w-14 rounded-full shadow-lg -mt-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-95 [&_svg]:size-7"
        >
          <Plus
            className={cn('transition-transform', open && 'rotate-45')}
            aria-hidden="true"
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        aria-describedby={undefined}
        className="px-4 pb-[calc(1rem+var(--safe-area-bottom))]"
      >
        <DrawerHeader className="flex items-center justify-between px-0 text-left">
          <DrawerTitle>{t('home.quickActions')}</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label={t('actions.close')}>
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="grid gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleAction(action)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl text-left transition-colors',
                action.primary
                  ? 'bg-primary/10 hover:bg-primary/20'
                  : 'bg-muted/50 hover:bg-muted'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center h-12 w-12 shrink-0 rounded-full',
                  action.primary ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className={cn('font-medium', action.primary && 'text-primary')}>
                  {action.label}
                </p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
