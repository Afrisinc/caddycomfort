import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const AdminLayoutContext = React.createContext<{
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}>({
  toggleSidebar: () => {},
  isSidebarOpen: false,
});

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <AdminLayoutContext.Provider value={{ toggleSidebar, isSidebarOpen }}>
      <div className="flex min-h-screen">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-x-hidden lg:ml-0">{children}</main>
      </div>
    </AdminLayoutContext.Provider>
  );
}
