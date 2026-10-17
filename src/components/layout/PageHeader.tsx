/**
 * Reusable page header with back button support
 */

import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showSettings?: boolean;
  onSettingsClick?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  showSettings = false,
  onSettingsClick,
  rightContent,
  className,
}: PageHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'bg-card border-b border-border sticky top-0 z-30 pt-[var(--safe-area-top)]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 min-h-14 px-4 max-w-lg mx-auto">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label={t('actions.back')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {rightContent}
          {showSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick || (() => navigate('/settings'))}
              aria-label={t('nav.settings')}
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
