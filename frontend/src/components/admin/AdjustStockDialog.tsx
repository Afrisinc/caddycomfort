import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inventoryApi } from '@/lib/api';
import { InventoryLogType } from '@/types/api';
import { toast } from 'sonner';

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  currentStock: number;
  onSuccess: () => void;
}

const TYPE_OPTIONS: {
  value: InventoryLogType;
  label: string;
  direction: 'increase' | 'decrease' | 'either';
}[] = [
  { value: 'RESTOCK', label: 'Restock (new stock received)', direction: 'increase' },
  { value: 'RETURN', label: 'Customer Return', direction: 'increase' },
  { value: 'SALE', label: 'Sale (manual deduction)', direction: 'decrease' },
  { value: 'DAMAGED', label: 'Damaged / Lost', direction: 'decrease' },
  { value: 'ADJUSTMENT', label: 'Manual Adjustment', direction: 'either' },
];

export function AdjustStockDialog({
  open,
  onOpenChange,
  productId,
  productName,
  currentStock,
  onSuccess,
}: AdjustStockDialogProps) {
  const [type, setType] = useState<InventoryLogType>('RESTOCK');
  const [amount, setAmount] = useState<number>(0);
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOption = TYPE_OPTIONS.find((o) => o.value === type)!;
  const effectiveDirection =
    selectedOption.direction === 'either' ? direction : selectedOption.direction;
  const signedQuantity = effectiveDirection === 'increase' ? amount : -amount;
  const projectedStock = currentStock + signedQuantity;

  const handleTypeChange = (value: InventoryLogType) => {
    setType(value);
    const option = TYPE_OPTIONS.find((o) => o.value === value)!;
    if (option.direction !== 'either') setDirection(option.direction);
  };

  const resetForm = () => {
    setType('RESTOCK');
    setAmount(0);
    setDirection('increase');
    setReason('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error('Enter an amount greater than zero');
      return;
    }

    if (!reason.trim()) {
      toast.error('A reason is required');
      return;
    }

    if (projectedStock < 0) {
      toast.error(
        `Not enough stock: only ${currentStock} unit${currentStock === 1 ? '' : 's'} available`,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryApi.adjustStock({
        productId,
        quantity: signedQuantity,
        type,
        reason: reason.trim(),
      });
      toast.success('Stock adjusted successfully');
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Update stock for <strong>{productName}</strong>. Current stock: {currentStock} unit
            {currentStock === 1 ? '' : 's'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="adjust-type">Reason Type</Label>
            <Select
              value={type}
              onValueChange={(v) => handleTypeChange(v as InventoryLogType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="adjust-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOption.direction === 'either' && (
            <div className="space-y-2">
              <Label htmlFor="adjust-direction">Direction</Label>
              <Select
                value={direction}
                onValueChange={(v) => setDirection(v as 'increase' | 'decrease')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="adjust-direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase stock (+)</SelectItem>
                  <SelectItem value="decrease">Decrease stock (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="adjust-amount">
              Units to {effectiveDirection === 'increase' ? 'add' : 'remove'}
            </Label>
            <Input
              id="adjust-amount"
              type="number"
              min={1}
              required
              value={amount || ''}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              New stock will be <strong>{Math.max(projectedStock, 0)}</strong> unit
              {Math.max(projectedStock, 0) === 1 ? '' : 's'}
              {projectedStock < 0 && (
                <span className="text-red-600"> — exceeds available stock</span>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-reason">Reason</Label>
            <Input
              id="adjust-reason"
              placeholder="e.g. Supplier delivery #4521"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent-rose hover:bg-accent-rose-dark"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Adjustment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
