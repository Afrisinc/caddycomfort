import { useEffect } from 'react';
import Link from '@/components/common/Link';
import { usePathname, useRouter } from '@/router/compat';
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
  Store,
  Boxes,
  ExternalLink,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Sales',
    items: [
      { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { title: 'Customers', href: '/admin/customers', icon: Users },
      { title: 'Coupons', href: '/admin/coupons', icon: Tag },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Products', href: '/admin/products', icon: Package },
      { title: 'Categories', href: '/admin/categories', icon: FolderTree },
      { title: 'Inventory', href: '/admin/inventory', icon: Boxes },
    ],
  },
  {
    label: 'System',
    items: [{ title: 'Settings', href: '/admin/settings', icon: Settings }],
  },
];

const itemBase =
  'group relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-rose/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onClose();
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Admin';
  const initials = displayName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Admin navigation"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-background transition-transform duration-300 ease-out lg:sticky lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-rose shadow-sm">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">Admin Panel</p>
              <p className="text-xs text-muted-foreground">CaddyComfort</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/50 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-5 last:mb-0">
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          itemBase,
                          active
                            ? 'bg-accent-rose/10 text-accent-rose'
                            : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-rose transition-all duration-200',
                            active ? 'opacity-100' : 'scale-y-0 opacity-0',
                          )}
                        />
                        <Icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            active
                              ? 'text-accent-rose'
                              : 'text-muted-foreground group-hover:text-foreground',
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-0.5 border-t px-3 py-3">
          <Link
            href="/"
            onClick={onClose}
            className={cn(itemBase, 'text-foreground/70 hover:bg-muted hover:text-foreground')}
          >
            <Store className="h-[18px] w-[18px] text-muted-foreground group-hover:text-foreground" />
            <span className="flex-1">View Store</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60" />
          </Link>
          <Link
            href="/contact"
            onClick={onClose}
            className={cn(itemBase, 'text-foreground/70 hover:bg-muted hover:text-foreground')}
          >
            <HelpCircle className="h-[18px] w-[18px] text-muted-foreground group-hover:text-foreground" />
            <span>Help & Support</span>
          </Link>
        </div>

        <div className="shrink-0 border-t p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-rose/10 text-xs font-semibold text-accent-rose">
              {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">{displayName}</p>
              {user?.email && (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
