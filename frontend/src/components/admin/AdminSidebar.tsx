'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Tag,
  FolderTree,
  HelpCircle,
  LogOut,
  ChevronDown,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [productsOpen, setProductsOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onClose();
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: Package,
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Customers',
      href: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Coupons',
      href: '/admin/coupons',
      icon: Tag,
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
    },
    { 
        title: 'Inventory', 
        href: '/admin/inventory',
        icon: Store,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 bg-background border-r h-screen flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="relative h-10 w-10 rounded-lg bg-accent-rose flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">CaddyComfort</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              if (item.submenu) {
                return (
                  <Collapsible
                    key={item.title}
                    open={productsOpen}
                    onOpenChange={setProductsOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-accent-rose/10"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            productsOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.href} href={subItem.href} onClick={onClose}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-sm ${
                              isActive(subItem.href)
                                ? 'bg-accent-rose/10 text-accent-rose hover:bg-accent-rose/20 hover:text-accent-rose'
                                : 'hover:bg-accent-rose/10'
                            }`}
                          >
                            {subItem.title}
                          </Button>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${
                      isActive(item.href)
                        ? 'bg-accent-rose/10 text-accent-rose hover:bg-accent-rose/20 hover:text-accent-rose'
                        : 'hover:bg-accent-rose/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          <Link href="/" onClick={onClose}>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Store className="h-5 w-5" />
              <span>View Store</span>
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent-rose/10"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help & Support</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
