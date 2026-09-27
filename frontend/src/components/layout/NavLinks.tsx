import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Link from '@/components/common/Link';
import { cn } from '@/lib/utils';
import { isNavActive, type NavItem } from '@/lib/navigation';

interface NavLinksProps {
  readonly items: NavItem[];
  readonly variant: 'bar' | 'drawer';
  readonly onNavigate?: () => void;
}

export function NavLinks({ items, variant, onNavigate }: NavLinksProps) {
  const { pathname, search } = useLocation();

  if (variant === 'bar') {
    return (
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = isNavActive(item.href, pathname, search);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex h-10 items-center rounded-full px-3.5 text-[13px] font-medium uppercase tracking-wider transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40 xl:px-4',
                  active ? 'text-accent-rose' : 'text-foreground/75 hover:text-foreground',
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-3.5 bottom-1.5 h-0.5 rounded-full bg-accent-rose transition-transform duration-300 xl:inset-x-4',
                    active ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isNavActive(item.href, pathname, search);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-12 items-center justify-between rounded-lg px-4 text-base font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40',
                active ? 'bg-accent-rose/10 text-accent-rose' : 'hover:bg-muted',
              )}
            >
              {item.label}
              <ChevronRight
                className={cn('h-4 w-4', active ? 'text-accent-rose' : 'text-muted-foreground')}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
