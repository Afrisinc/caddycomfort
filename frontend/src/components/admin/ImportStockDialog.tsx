'use client';

import { useState } from 'react';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { inventoryApi } from '@/lib/api';
import { InventoryLogType, InventoryValuationItem, StockAdjustmentInput } from '@/types/api';
import { toast } from 'sonner';

interface ImportStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryValuationItem[];
  onSuccess: () => void;
}

const VALID_TYPES: InventoryLogType[] = ['RESTOCK', 'SALE', 'RETURN', 'DAMAGED', 'ADJUSTMENT'];

interface ParsedRow {
  line: number;
  sku: string;
  type?: InventoryLogType;
  quantity?: number;
  reason?: string;
  productId?: string;
  error?: string;
}

// Minimal CSV parser for the simple, unquoted "sku,type,quantity,reason" format
// this import expects — not a general-purpose RFC4180 parser.
function parseCsv(text: string, items: InventoryValuationItem[]): ParsedRow[] {
  const skuIndex = new Map(items.map((item) => [item.sku.trim().toLowerCase(), item]));
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const startsWithHeader = /^sku\s*,/i.test(lines[0]);
  const dataLines = startsWithHeader ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    const [skuRaw, typeRaw, quantityRaw, ...reasonParts] = line.split(',');
    const sku = (skuRaw || '').trim();
    const typeText = (typeRaw || '').trim().toUpperCase();
    const quantity = parseInt((quantityRaw || '').trim(), 10);
    const reason = reasonParts.join(',').trim();
    const row: ParsedRow = { line: idx + (startsWithHeader ? 2 : 1), sku, reason: reason || undefined };

    if (!sku) {
      row.error = 'Missing SKU';
      return row;
    }
    const item = skuIndex.get(sku.toLowerCase());
    if (!item) {
      row.error = 'SKU not found';
      return row;
    }
    row.productId = item.productId;

    if (!VALID_TYPES.includes(typeText as InventoryLogType)) {
      row.error = `Invalid type "${typeRaw?.trim()}"`;
      return row;
    }
    row.type = typeText as InventoryLogType;

    if (!Number.isFinite(quantity) || quantity === 0) {
      row.error = 'Quantity must be a non-zero number';
      return row;
    }
    row.quantity = quantity;

    if (!reason) {
      row.error = 'Reason is required';
      return row;
    }

    return row;
  });
}

export function ImportStockDialog({ open, onOpenChange, items, onSuccess }: ImportStockDialogProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setRows(parseCsv(text, items));
  };

  const reset = () => {
    setRows([]);
    setFileName('');
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;

    const adjustments: StockAdjustmentInput[] = validRows.map((r) => ({
      productId: r.productId!,
      quantity: r.type === 'SALE' || r.type === 'DAMAGED' ? -Math.abs(r.quantity!) : r.quantity!,
      type: r.type!,
      reason: r.reason!,
    }));

    try {
      setIsSubmitting(true);
      const result = await inventoryApi.bulkAdjustStock(adjustments);
      if (result.summary.failed > 0) {
        toast.warning(`Imported ${result.summary.successful} of ${result.summary.total} rows — ${result.summary.failed} failed`);
      } else {
        toast.success(`Imported ${result.summary.successful} stock adjustment${result.summary.successful === 1 ? '' : 's'}`);
      }
      onOpenChange(false);
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to import stock adjustments');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!isSubmitting) { onOpenChange(next); if (!next) reset(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Stock</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns <code className="text-xs bg-muted px-1 py-0.5 rounded">sku,type,quantity,reason</code>.
            Type must be one of RESTOCK, SALE, RETURN, DAMAGED, ADJUSTMENT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label
            htmlFor="stock-csv"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {fileName || 'Click to choose a CSV file'}
            </span>
            <input id="stock-csv" type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
          </label>

          {rows.length > 0 && (
            <div className="text-sm space-y-2">
              <p>
                <span className="text-green-600 font-medium">{validRows.length} valid</span>
                {invalidRows.length > 0 && (
                  <span className="text-red-600 font-medium">, {invalidRows.length} invalid</span>
                )}{' '}
                of {rows.length} row{rows.length === 1 ? '' : 's'}
              </p>
              {invalidRows.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {invalidRows.map((r) => (
                    <div key={r.line} className="flex items-start gap-1.5 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Line {r.line} ({r.sku || 'blank'}): {r.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || validRows.length === 0}
            className="bg-accent-rose hover:bg-accent-rose-dark"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              `Import ${validRows.length || ''} Row${validRows.length === 1 ? '' : 's'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
