import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLayoutContext } from '@/components/admin/adminLayoutContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const STORAGE_KEY = 'admin-sidebar-collapsed';

function readPreference(): boolean | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? null : stored === 'true';
  } catch {
    return null;
  }
}

function savePreference(collapsed: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch {
    return;
  }
}

export function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [preference, setPreference] = React.useState<boolean | null>(readPreference);
  const isWide = useMediaQuery('(min-width: 1280px)');
  const collapsed = preference ?? !isWide;

  const toggleSidebar = React.useCallback(() => setIsSidebarOpen((prev) => !prev), []);
  const closeSidebar = React.useCallback(() => setIsSidebarOpen(false), []);
  const toggleCollapsed = React.useCallback(() => {
    const next = !collapsed;
    setPreference(next);
    savePreference(next);
  }, [collapsed]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggleCollapsed]);

  const context = React.useMemo(
    () => ({ toggleSidebar, isSidebarOpen }),
    [toggleSidebar, isSidebarOpen],
  );

  return (
    <AdminLayoutContext.Provider value={context}>
      <TooltipProvider delayDuration={150}>
        <div className="flex min-h-screen">
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
          />
          <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
        </div>
      </TooltipProvider>
    </AdminLayoutContext.Provider>
  );
}
