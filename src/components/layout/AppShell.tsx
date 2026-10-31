/**
 * App Shell - Main layout with bottom navigation
 */

import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clipboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FABMenu } from './FABMenu';

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/inventory', icon: Clipboard, label: t('nav.inventory') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <main
        className={cn(
          'flex-1',
          showNav
            ? 'pb-[calc(5rem+var(--safe-area-bottom))]'
            : 'pb-[var(--safe-area-bottom)]'
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-[var(--safe-area-bottom)]">
          <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
            {/* Left nav item */}
            <NavButton
              icon={navItems[0].icon}
              label={navItems[0].label}
              isActive={location.pathname === navItems[0].path}
              onClick={() => navigate(navItems[0].path)}
            />

            {/* Center FAB */}
            <FABMenu />

            {/* Right nav item */}
            <NavButton
              icon={navItems[1].icon}
              label={navItems[1].label}
              isActive={location.pathname === navItems[1].path}
              onClick={() => navigate(navItems[1].path)}
            />
          </div>
        </nav>
      )}
    </div>
  );
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-h-[44px] min-w-[60px]',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className={cn('text-xs', isActive ? 'font-semibold' : 'font-medium')}>{label}</span>
    </button>
  );
}
