import { useCallback, useRef, type MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { cn } from '@/lib/utils';

export interface SectionNavItem {
  readonly id: string;
  readonly title: string;
  readonly icon?: LucideIcon;
}

interface SectionNavProps {
  readonly items: readonly SectionNavItem[];
  readonly label: string;
  readonly className?: string;
}

function headerOffset() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--admin-header-h');
  return Number.parseFloat(value) || 0;
}

export function SectionNav({ items, label, className }: SectionNavProps) {
  const navRef = useRef<HTMLElement>(null);

  const getOffset = useCallback(() => {
    const nav = navRef.current;
    const stacked = nav && getComputedStyle(nav).flexDirection !== 'column';
    return headerOffset() + (stacked ? nav.offsetHeight : 0);
  }, []);

  const ids = useRef(items.map((item) => item.id)).current;
  const active = useScrollSpy(ids, getOffset);

  const jumpTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - getOffset() - 16,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
    history.replaceState(null, '', `#${id}`);
    target.focus({ preventScroll: true });
  };

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={cn(
        'sticky z-20 -mx-4 flex gap-1 overflow-x-auto border-b bg-background/95 px-4 py-2 backdrop-blur [scrollbar-width:none] supports-backdrop-filter:bg-background/80 sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden',
        'top-(--admin-header-h) xl:top-[calc(var(--admin-header-h)+2rem)] xl:mx-0 xl:flex-col xl:self-start xl:overflow-visible xl:border-0 xl:bg-transparent xl:p-0 xl:backdrop-blur-none',
        className,
      )}
    >
      {items.map(({ id, title, icon: Icon }) => {
        const current = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => jumpTo(e, id)}
            aria-current={current ? 'location' : undefined}
            className={cn(
              'flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-rose/40',
              current
                ? 'bg-accent-rose/10 text-accent-rose'
                : 'text-foreground/70 hover:bg-muted hover:text-foreground',
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
            {title}
          </a>
        );
      })}
    </nav>
  );
}
