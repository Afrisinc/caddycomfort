'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { inventoryApi } from '@/lib/api';
import { InventoryLogEntry, InventoryLogType } from '@/types/api';
import { toast } from 'sonner';

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

const TYPE_BADGES: Record<InventoryLogType, { label: string; className: string }> = {
  RESTOCK: { label: 'Restock', className: 'bg-green-100 text-green-700' },
  RETURN: { label: 'Return', className: 'bg-blue-100 text-blue-700' },
  SALE: { label: 'Sale', className: 'bg-gray-100 text-gray-700' },
  DAMAGED: { label: 'Damaged', className: 'bg-red-100 text-red-700' },
  ADJUSTMENT: { label: 'Adjustment', className: 'bg-purple-100 text-purple-700' },
};

export function StockHistoryDialog({ open, onOpenChange, productId, productName }: StockHistoryDialogProps) {
  const [logs, setLogs] = useState<InventoryLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        const result = await inventoryApi.getProductLogs(productId);
        if (!cancelled) setLogs(result.logs);
      } catch (error: any) {
        if (!cancelled) toast.error(error.message || 'Failed to load stock history');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock History</DialogTitle>
          <DialogDescription>Recent inventory movements for <strong>{productName}</strong>.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-accent-rose" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No stock movements recorded yet</p>
        ) : (
          <div className="max-h-96 overflow-y-auto -mx-2 px-2 space-y-2">
            {logs.map((log) => {
              const badge = TYPE_BADGES[log.type];
              return (
                <div key={log.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={badge.className}>{badge.label}</Badge>
                      <span className={`text-sm font-medium ${log.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {log.quantity >= 0 ? '+' : ''}
                        {log.quantity}
                      </span>
                    </div>
                    {log.reason && <p className="text-xs text-muted-foreground mt-1">{log.reason}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(log.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
