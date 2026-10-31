/**
 * Category Badge Component - filter chip (toggle button)
 */

import { badgeVariants } from '@/components/ui/badge';
import type { CropCategory } from '@/domain/contracts/types';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: CropCategory;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryBadge({
  category,
  count,
  isSelected,
  onClick,
  className
}: CategoryBadgeProps) {
  return (
    <button
      type="button"
      aria-pressed={!!isSelected}
      onClick={onClick}
      className={cn(
        badgeVariants({ variant: isSelected ? 'default' : 'outline' }),
        'shrink-0 py-1.5 px-3 gap-1.5',
        className
      )}
    >
      <span aria-hidden="true">{category.icon}</span>
      <span>{category.name}</span>
      {count !== undefined && (
        <span className="text-xs font-normal">({count})</span>
      )}
    </button>
  );
}
