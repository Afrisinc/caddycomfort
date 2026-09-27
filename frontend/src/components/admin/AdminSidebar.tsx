import { useEffect, type ReactNode } from 'react';
import Link from '@/components/common/Link';
import { usePathname, useRouter } from '@/router/compat';
import {
  BarChart3,
  Boxes,
  ExternalLink,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
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

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const idleItem = 'text-foreground/70 hover:bg-muted hover:text-foreground';

function RailTooltip({
  rail,
  label,
  children,
}: {
  readonly rail: boolean;
  readonly label: ReactNode;
  readonly children: ReactNode;
}) {
  if (!rail) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

interface SidebarLinkProps {
  readonly href: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly rail: boolean;
  readonly active?: boolean;
  readonly external?: boolean;
  readonly onNavigate: () => void;
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  rail,
  active,
  external,
  onNavigate,
}: SidebarLinkProps) {
  return (
    <RailTooltip rail={rail} label={label}>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        aria-label={rail ? label : undefined}
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
        className={cn(
          'group relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors duration-150',
          rail ? 'mx-auto w-10 justify-center' : 'w-full gap-3 px-3',
          focusRing,
          active ? 'bg-accent-rose/10 text-accent-rose' : idleItem,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-accent-rose transition-all duration-200',
            rail ? '-left-3' : 'left-0',
            active ? 'opacity-100' : 'scale-y-0 opacity-0',
          )}
        />
        <Icon
          aria-hidden="true"
          className={cn(
            'h-4.5 w-4.5 shrink-0 transition-colors',
            active ? 'text-accent-rose' : 'text-muted-foreground group-hover:text-foreground',
          )}
        />
        {!rail && <span className="flex-1 truncate">{label}</span>}
        {!rail && external && (
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/60" />
        )}
      </Link>
    </RailTooltip>
  );
}

export function AdminSidebar({ isOpen, onClose, collapsed, onToggleCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isTabletUp = useMediaQuery('(min-width: 768px)');
  const rail = collapsed && isTabletUp;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isTabletUp) onClose();
  }, [isTabletUp, onClose]);

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
  const collapseLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Admin navigation"
        data-collapsed={rail || undefined}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-dvh w-72 shrink-0 flex-col border-r bg-background transition-[transform,width] duration-300 ease-out md:sticky md:z-30 md:translate-x-0',
          rail ? 'md:w-18' : 'md:w-64',
          isOpen ? 'translate-x-0 shadow-xl md:shadow-none' : '-translate-x-full',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b',
            rail ? 'justify-center px-2' : 'justify-between gap-2 px-4',
          )}
        >
          <RailTooltip rail={rail} label="CaddyComfort admin">
            <Link
              href="/admin"
              onClick={onClose}
              aria-label={rail ? 'Admin dashboard' : undefined}
              className={cn('flex min-w-0 items-center gap-3 rounded-lg', focusRing)}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-rose shadow-sm">
                <Store className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              {!rail && (
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-sm font-bold">Admin Panel</span>
                  <span className="block truncate text-xs text-muted-foreground">CaddyComfort</span>
                </span>
              )}
            </Link>
          </RailTooltip>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden',
              focusRing,
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section, index) => (
            <div key={section.label} className={cn(rail ? 'mb-3' : 'mb-5', 'last:mb-0')}>
              {rail ? (
                index > 0 && <hr className="mx-auto mb-3 w-6 border-border" />
              ) : (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <SidebarLink
                      href={item.href}
                      icon={item.icon}
                      label={item.title}
                      rail={rail}
                      active={isActive(item.href)}
                      onNavigate={onClose}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t px-3 py-3">
          <SidebarLink
            href="/"
            icon={Store}
            label="View store"
            rail={rail}
            external
            onNavigate={onClose}
          />
          <SidebarLink
            href="/contact"
            icon={HelpCircle}
            label="Help & support"
            rail={rail}
            onNavigate={onClose}
          />
          <RailTooltip rail={rail} label={`${collapseLabel} (Ctrl+B)`}>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapseLabel}
              aria-expanded={!collapsed}
              className={cn(
                'hidden h-10 items-center rounded-lg text-sm font-medium transition-colors md:flex',
                rail ? 'mx-auto w-10 justify-center' : 'w-full gap-3 px-3',
                focusRing,
                idleItem,
              )}
            >
              <CollapseIcon className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
              {!rail && (
                <>
                  <span className="flex-1 text-left">Collapse</span>
                  <kbd className="rounded border bg-muted px-1.5 font-sans text-[10px] text-muted-foreground">
                    Ctrl B
                  </kbd>
                </>
              )}
            </button>
          </RailTooltip>
        </div>

        <div className="shrink-0 border-t p-3">
          <div
            className={cn(
              'flex items-center rounded-lg',
              rail ? 'flex-col gap-2' : 'gap-3 px-2 py-2',
            )}
          >
            <RailTooltip
              rail={rail}
              label={
                <span className="block leading-tight">
                  {displayName}
                  {user?.email && <span className="block opacity-70">{user.email}</span>}
                </span>
              }
            >
              <span
                tabIndex={rail ? 0 : undefined}
                aria-label={rail ? `Signed in as ${displayName}` : undefined}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-rose/10 text-xs font-semibold text-accent-rose',
                  rail && focusRing,
                )}
              >
                {initials}
              </span>
            </RailTooltip>
            {!rail && (
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{displayName}</p>
                {user?.email && (
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
            )}
            <RailTooltip rail={rail} label="Log out">
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title={rail ? undefined : 'Log out'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:hover:bg-red-950/40"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </RailTooltip>
          </div>
        </div>
      </aside>
    </>
  );
}
