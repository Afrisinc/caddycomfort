import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { cn } from '@/lib/utils';
import { isNavActive, type NavItem } from '@/lib/navigation';

interface NavLinksProps {
  readonly items: NavItem[];
  readonly variant: 'bar' | 'drawer';
  readonly onNavigate?: () => void;
}

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40';

function isItemActive(item: NavItem, pathname: string, search: string) {
  if (item.children?.length) return pathname.startsWith(item.href.split('?')[0]);
  return isNavActive(item.href, pathname, search);
}

function MegaMenu({
  item,
  pathname,
  search,
  open,
  onNavigate,
}: Readonly<{
  item: NavItem;
  pathname: string;
  search: string;
  open: boolean;
  onNavigate: () => void;
}>) {
  const groups = item.children ?? [];
  const current = pathname === '/shop' ? new URLSearchParams(search).get('category') : null;
  const isCurrent = (href: string) =>
    current !== null && new URLSearchParams(href.split('?')[1]).get('category') === current;

  return (
    <div
      className={cn(
        'absolute left-1/2 top-full z-50 w-[min(60rem,92vw)] -translate-x-1/2 pt-3 transition-[opacity,transform,visibility] duration-200 ease-out',
        open
          ? 'visible translate-y-0 opacity-100'
          : 'pointer-events-none invisible -translate-y-1 opacity-0',
      )}
    >
      <div className="overflow-hidden rounded-2xl border bg-background shadow-2xl ring-1 ring-black/5">
        <div className="grid grid-cols-2 gap-5 p-6 md:grid-cols-3 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.href} className="min-w-0">
              <Link
                href={group.href}
                onClick={onNavigate}
                className={cn('group/card block rounded-xl', focusRing)}
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
                  {group.image ? (
                    <Image
                      src={group.image}
                      alt=""
                      fill
                      sizes="220px"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover/card:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full items-center justify-center bg-linear-to-br from-accent-rose-subtle to-accent-rose-muted font-serif text-4xl font-bold text-accent-rose/30"
                    >
                      {group.label.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-2 px-0.5 pt-2.5">
                  <span
                    className={cn(
                      'truncate text-sm font-semibold transition-colors group-hover/card:text-accent-rose',
                      isCurrent(group.href) && 'text-accent-rose',
                    )}
                  >
                    {group.label}
                  </span>
                  {group.count ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {group.count} {group.count === 1 ? 'item' : 'items'}
                    </span>
                  ) : null}
                </div>
              </Link>
              {group.children?.length ? (
                <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  {group.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(
                          'rounded text-[13px] transition-colors hover:text-accent-rose',
                          focusRing,
                          isCurrent(child.href) ? 'text-accent-rose' : 'text-muted-foreground',
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t bg-muted/40 px-6 py-3.5">
          <p className="text-sm text-muted-foreground">
            Comfortable pieces for every move, in every size.
          </p>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group/all inline-flex shrink-0 items-center gap-1 rounded text-sm font-medium text-accent-rose',
              focusRing,
            )}
          >
            Shop all products
            <ChevronRight className="h-4 w-4 transition-transform group-hover/all:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function BarItem({
  item,
  pathname,
  search,
}: Readonly<{ item: NavItem; pathname: string; search: string }>) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = isItemActive(item, pathname, search);
  const hasMenu = !!item.children?.length;

  const schedule = (next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setOpen(false), [pathname, search]);

  return (
    <li
      className="relative"
      onMouseEnter={hasMenu ? () => schedule(true, 80) : undefined}
      onMouseLeave={hasMenu ? () => schedule(false, 160) : undefined}
      onFocus={hasMenu ? () => schedule(true, 0) : undefined}
      onBlur={
        hasMenu
          ? (e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) schedule(false, 0);
            }
          : undefined
      }
      onKeyDown={hasMenu ? (e) => e.key === 'Escape' && schedule(false, 0) : undefined}
    >
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        aria-haspopup={hasMenu ? 'true' : undefined}
        aria-expanded={hasMenu ? open : undefined}
        className={cn(
          'relative inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium uppercase tracking-wider transition-colors xl:px-4',
          focusRing,
          active || open ? 'text-accent-rose' : 'text-foreground/75 hover:text-foreground',
        )}
      >
        {item.label}
        {hasMenu && (
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
          />
        )}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-3.5 bottom-1.5 h-0.5 rounded-full bg-accent-rose transition-transform duration-300 xl:inset-x-4',
            active ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </Link>
      {hasMenu && (
        <MegaMenu
          item={item}
          pathname={pathname}
          search={search}
          open={open}
          onNavigate={() => schedule(false, 0)}
        />
      )}
    </li>
  );
}

function DrawerItem({
  item,
  active,
  onNavigate,
}: Readonly<{ item: NavItem; active: boolean; onNavigate?: () => void }>) {
  const [open, setOpen] = useState(false);
  const rowClass = cn(
    'flex h-12 items-center justify-between rounded-lg px-4 text-base font-medium transition-colors',
    focusRing,
    active ? 'bg-accent-rose/10 text-accent-rose' : 'hover:bg-muted',
  );

  if (!item.children?.length) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={rowClass}
      >
        {item.label}
        <ChevronRight
          className={cn('h-4 w-4', active ? 'text-accent-rose' : 'text-muted-foreground')}
        />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(rowClass, 'w-full')}
      >
        {item.label}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            open && 'rotate-180',
            active ? 'text-accent-rose' : 'text-muted-foreground',
          )}
        />
      </button>
      {open && (
        <ul className="ml-4 space-y-0.5 border-l py-1 pl-3">
          <li>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex h-10 items-center rounded-md px-3 text-sm font-medium',
                focusRing,
              )}
            >
              All products
            </Link>
          </li>
          {item.children.map((group) => (
            <li key={group.href}>
              <Link
                href={group.href}
                onClick={onNavigate}
                className={cn(
                  'flex h-10 items-center rounded-md px-3 text-sm font-medium',
                  focusRing,
                )}
              >
                {group.label}
              </Link>
              {group.children?.length ? (
                <ul className="ml-3 border-l pl-2">
                  {group.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(
                          'flex h-9 items-center rounded-md px-3 text-sm text-foreground/70',
                          focusRing,
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function NavLinks({ items, variant, onNavigate }: NavLinksProps) {
  const { pathname, search } = useLocation();

  if (variant === 'bar') {
    return (
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <BarItem key={item.href} item={item} pathname={pathname} search={search} />
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.href}>
          <DrawerItem
            item={item}
            active={isItemActive(item, pathname, search)}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  );
}
