import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLayoutContext } from '@/components/admin/adminLayoutContext';

interface AdminHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly children?: React.ReactNode;
}

export function AdminHeader({ title, description, children }: AdminHeaderProps) {
  const { toggleSidebar } = React.useContext(AdminLayoutContext);
  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() =>
      root.style.setProperty('--admin-header-h', `${header.offsetHeight}px`),
    );
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--admin-header-h');
    };
  }, []);

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 shrink-0 md:hidden"
            onClick={toggleSidebar}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
            {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2 sm:gap-3">{children}</div>}
      </div>
    </div>
  );
}
