import type { ComponentProps, ReactNode } from 'react';
import Link from '@/components/common/Link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Align = 'left' | 'right' | 'center';

export interface DataColumn {
  readonly key: string;
  readonly label: string;
  readonly align?: Align;
  readonly hideLabel?: boolean;
  readonly className?: string;
}

const alignClass: Record<Align, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

interface DataTableProps {
  readonly columns: readonly DataColumn[];
  readonly children: ReactNode;
  readonly label?: string;
  readonly loading?: boolean;
  readonly skeletonRows?: number;
  readonly minWidth?: string;
  readonly bordered?: boolean;
  readonly className?: string;
}

export function DataTable({
  columns,
  children,
  label,
  loading,
  skeletonRows = 6,
  minWidth = 'min-w-176',
  bordered = true,
  className,
}: DataTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden bg-card',
        bordered ? 'rounded-2xl border' : 'rounded-xl border',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table
          className={cn('w-full', minWidth)}
          aria-label={label}
          aria-busy={loading || undefined}
        >
          <thead className="border-b bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-medium tracking-wider whitespace-nowrap text-muted-foreground uppercase',
                    alignClass[column.align ?? 'left'],
                    column.className,
                  )}
                >
                  {column.hideLabel ? (
                    <span className="sr-only">{column.label}</span>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td colSpan={columns.length} className="p-4">
                      <Skeleton className="h-9 w-full" />
                    </td>
                  </tr>
                ))
              : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DataRow({ className, ...props }: Readonly<ComponentProps<'tr'>>) {
  return (
    <tr
      className={cn('border-b transition-colors last:border-0 hover:bg-muted/40', className)}
      {...props}
    />
  );
}

interface DataCellProps extends ComponentProps<'td'> {
  readonly align?: Align;
  readonly numeric?: boolean;
  readonly muted?: boolean;
  readonly strong?: boolean;
}

export function DataCell({
  align = 'left',
  numeric,
  muted,
  strong,
  className,
  ...props
}: Readonly<DataCellProps>) {
  return (
    <td
      className={cn(
        'p-4 align-middle text-sm',
        alignClass[align],
        numeric && 'tabular-nums',
        muted && 'text-muted-foreground',
        strong && 'font-semibold',
        className,
      )}
      {...props}
    />
  );
}

interface CellTextProps {
  readonly children: ReactNode;
  readonly href?: string;
  readonly mono?: boolean;
  readonly className?: string;
}

const primaryClass = 'block max-w-72 truncate text-sm font-medium text-foreground';

export function CellTitle({ children, href, mono, className }: CellTextProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          primaryClass,
          'outline-none hover:text-accent-rose focus-visible:underline',
          mono && 'font-mono',
          className,
        )}
      >
        {children}
      </Link>
    );
  }
  return <p className={cn(primaryClass, mono && 'font-mono', className)}>{children}</p>;
}

export function CellMeta({ children, mono, className }: Omit<CellTextProps, 'href'>) {
  return (
    <p
      className={cn(
        'max-w-72 truncate text-xs text-muted-foreground',
        mono && 'font-mono',
        className,
      )}
    >
      {children}
    </p>
  );
}
