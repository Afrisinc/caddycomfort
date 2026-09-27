import { useEffect, useState } from 'react';
import {
  AlertOctagon,
  History,
  PackagePlus,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { inventoryApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { InventoryLogEntry, InventoryLogType } from '@/types/api';

interface StockHistoryDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly productId: string;
  readonly productName: string;
}

const TYPE_STYLES: Record<
  InventoryLogType,
  { label: string; icon: LucideIcon; className: string }
> = {
  RESTOCK: {
    label: 'Restock',
    icon: PackagePlus,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  RETURN: {
    label: 'Return',
    icon: RotateCcw,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  SALE: {
    label: 'Sale',
    icon: ShoppingBag,
    className: 'bg-muted text-muted-foreground',
  },
  DAMAGED: {
    label: 'Damaged',
    icon: AlertOctagon,
    className: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    icon: SlidersHorizontal,
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  },
};

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function StockHistoryDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: StockHistoryDialogProps) {
  const [logs, setLogs] = useState<InventoryLogEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLogs(null);
    setFailed(false);
    inventoryApi
      .getProductLogs(productId)
      .then((result) => !cancelled && setLogs(result.logs))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open, productId, attempt]);

  const renderBody = () => {
    if (failed) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">We couldn’t load the stock history.</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setAttempt((n) => n + 1)}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }
    if (!logs) {
      return <SkeletonList rows={4} bordered label="Loading stock history" />;
    }
    if (logs.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <History className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">No stock movements recorded yet.</p>
        </div>
      );
    }
    return (
      <ul className="-mx-1 max-h-96 space-y-2 overflow-y-auto px-1">
        {logs.map((log) => {
          const style = TYPE_STYLES[log.type];
          const Icon = style.icon;
          const incoming = log.quantity >= 0;
          return (
            <li key={log.id} className="flex items-center gap-3 rounded-xl border px-3.5 py-3">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  style.className,
                )}
              >
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{style.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {log.reason || formatWhen(log.createdAt)}
                </p>
                {log.reason && (
                  <p className="text-xs text-muted-foreground/80">{formatWhen(log.createdAt)}</p>
                )}
              </div>
              <span
                className={cn(
                  'shrink-0 text-sm font-semibold tabular-nums',
                  incoming
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {incoming ? '+' : '−'}
                {Math.abs(log.quantity)}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock history</DialogTitle>
          <DialogDescription>
            Recent inventory movements for{' '}
            <span className="font-medium text-foreground">{productName}</span>.
          </DialogDescription>
        </DialogHeader>
        {renderBody()}
      </DialogContent>
    </Dialog>
  );
}
