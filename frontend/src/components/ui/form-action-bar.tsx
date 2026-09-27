import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormActionBarProps {
  readonly visible: boolean;
  readonly saving?: boolean;
  readonly message?: string;
  readonly submitLabel?: string;
  readonly secondaryLabel?: string;
  readonly onSecondary?: () => void;
}

export function FormActionBar({
  visible,
  saving,
  message = 'You have unsaved changes',
  submitLabel = 'Save changes',
  secondaryLabel = 'Discard',
  onSecondary,
}: FormActionBarProps) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/95 px-5 py-3 shadow-lg backdrop-blur transition-all',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <p className="text-sm font-medium">{message}</p>
      <div className="flex gap-2">
        {onSecondary && (
          <Button
            type="button"
            variant="outline"
            onClick={onSecondary}
            disabled={saving}
            tabIndex={visible ? 0 : -1}
          >
            {secondaryLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving}
          tabIndex={visible ? 0 : -1}
          className="gap-2 bg-accent-rose hover:bg-accent-rose-dark"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
