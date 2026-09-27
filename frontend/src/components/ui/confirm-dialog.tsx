import { useState, type MouseEvent, type ReactNode } from 'react';
import { AlertTriangle, Loader2, Trash2, type LucideIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

type ConfirmTone = 'danger' | 'warning';

const TONES: Record<ConfirmTone, { icon: LucideIcon; badge: string; action: string }> = {
  danger: {
    icon: Trash2,
    badge: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
    action: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    action: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40',
  },
};

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly children?: ReactNode;
  readonly tone?: ConfirmTone;
  readonly icon?: LucideIcon;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly pendingLabel?: string;
  readonly blocked?: boolean;
  readonly onConfirm: () => Promise<void> | void;
  readonly onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  tone = 'danger',
  icon,
  confirmLabel,
  cancelLabel = 'Cancel',
  pendingLabel,
  blocked,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const style = TONES[tone];
  const Icon = icon ?? style.icon;

  const confirm = async (event: MouseEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialogContent>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              style.badge,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
            {children}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <AlertDialogCancel onClick={onCancel} disabled={pending} className="h-10 sm:h-9">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={pending || blocked}
            className={cn('h-10 gap-2 sm:h-9', style.action)}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending && pendingLabel ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ConfirmNotice({ children }: { readonly children: ReactNode }) {
  return (
    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
      {children}
    </p>
  );
}
