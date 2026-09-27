import { Pagination } from '@/components/ui/pagination';
import { pageCount } from '@/lib/pagination';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly onPageChange: (page: number) => void;
  readonly noun: readonly [singular: string, plural: string];
  readonly className?: string;
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  noun,
  className,
}: TablePaginationProps) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const label = total === 1 ? noun[0] : noun[1];

  return (
    <div
      className={cn('mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row', className)}
    >
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        {total <= pageSize ? (
          <>
            <span className="font-medium text-foreground">{total.toLocaleString()}</span> {label}
          </>
        ) : (
          <>
            Showing{' '}
            <span className="font-medium text-foreground">
              {first.toLocaleString()}–{last.toLocaleString()}
            </span>{' '}
            of <span className="font-medium text-foreground">{total.toLocaleString()}</span> {label}
          </>
        )}
      </p>
      <Pagination page={page} totalPages={pageCount(total, pageSize)} onPageChange={onPageChange} />
    </div>
  );
}
