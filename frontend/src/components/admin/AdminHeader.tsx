import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLayoutContext } from './AdminLayout';

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ title, description, children }: AdminHeaderProps) {
  const { toggleSidebar } = React.useContext(AdminLayoutContext);

  return (
    <div className="bg-background border-b sticky top-0 z-30">
      <div className="px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
