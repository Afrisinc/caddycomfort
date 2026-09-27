import { useId, useState, type FormEvent } from 'react';
import { Loader2, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CouponFormProps {
  readonly appliedCode?: string | null;
  readonly isApplying?: boolean;
  readonly hint?: string;
  readonly onApply: (code: string) => void;
  readonly onRemove: () => void;
}

export function CouponForm({ appliedCode, isApplying, hint, onApply, onRemove }: CouponFormProps) {
  const inputId = useId();
  const [code, setCode] = useState('');

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-300">
          <Tag className="h-4 w-4" />
          <span>
            <span className="font-mono font-semibold">{appliedCode}</span> applied
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            setCode('');
            onRemove();
          }}
          aria-label={`Remove coupon ${appliedCode}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-800 transition-colors outline-none hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) onApply(trimmed);
  };

  return (
    <form onSubmit={submit}>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
        Coupon code
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={isApplying}
          autoComplete="off"
          className="h-10 font-mono uppercase placeholder:font-sans placeholder:normal-case"
        />
        <Button
          type="submit"
          variant="outline"
          className="h-10 px-4"
          disabled={isApplying || !code.trim()}
        >
          {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </form>
  );
}
