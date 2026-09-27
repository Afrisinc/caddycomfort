import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPageItems } from '@/lib/pagination';

interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  readonly className?: string;
}

const itemClass =
  'inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40 disabled:pointer-events-none disabled:opacity-40';

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(itemClass, 'text-muted-foreground hover:bg-muted hover:text-foreground')}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <ul className="flex items-center gap-1">
        {getPageItems(page, totalPages).map((item, i) =>
          item === 'gap' ? (
            <li
              key={i === 1 ? 'gap-start' : 'gap-end'}
              aria-hidden="true"
              className="flex h-10 w-8 items-center justify-center text-muted-foreground"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  itemClass,
                  item === page
                    ? 'bg-foreground text-background'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(itemClass, 'text-muted-foreground hover:bg-muted hover:text-foreground')}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
