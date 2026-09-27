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
  readonly className?: string;
}

export function FormActionBar({
  visible,
  saving,
  message = 'You have unsaved changes',
  submitLabel = 'Save changes',
  secondaryLabel = 'Discard',
  onSecondary,
  className,
}: FormActionBarProps) {
  if (!visible) return null;

  return (
    <>
      <div aria-hidden="true" className="h-32 sm:hidden" />
      <section
        aria-label="Save changes"
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2.5 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-6px_16px_-8px_rgb(0_0_0/0.12)] backdrop-blur animate-in fade-in-0 slide-in-from-bottom-2 duration-200',
          'sm:sticky sm:inset-x-auto sm:bottom-4 sm:z-20 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-2xl sm:border sm:px-5 sm:py-3 sm:shadow-lg',
          className,
        )}
      >
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-rose" aria-hidden="true" />
          <span className="truncate">{message}</span>
        </p>
        <div
          className={cn(
            'grid gap-2 sm:flex sm:shrink-0',
            onSecondary ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {onSecondary && (
            <Button
              type="button"
              variant="outline"
              onClick={onSecondary}
              disabled={saving}
              className="h-10 sm:h-9"
            >
              {secondaryLabel}
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="h-10 gap-2 bg-accent-rose hover:bg-accent-rose-dark sm:h-9"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </section>
    </>
  );
}
