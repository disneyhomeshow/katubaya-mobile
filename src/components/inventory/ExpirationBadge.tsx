/**
 * Expiration Badge - Visual indicator for lot expiration status
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ExpirationStatus } from '@/domain/contracts/types';
import { getExpirationColor } from '@/domain/rules/expiration';

interface ExpirationBadgeProps {
  status: ExpirationStatus;
  daysRemaining: number;
  className?: string;
}

export function ExpirationBadge({ status, daysRemaining, className }: ExpirationBadgeProps) {
  const { t } = useTranslation();
  const colors = getExpirationColor(status);

  const getLabel = () => {
    if (daysRemaining < 0) {
      return t('inventory.expired', { count: Math.abs(daysRemaining) });
    }
    if (daysRemaining === 0) {
      return t('inventory.expiresToday');
    }
    return t('inventory.expiresIn', { count: daysRemaining });
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        'border whitespace-nowrap',
        className
      )}
    >
      {getLabel()}
    </Badge>
  );
}
