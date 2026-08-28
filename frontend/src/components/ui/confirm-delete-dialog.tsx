'use client';

import { ReactNode, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. `Delete Category` */
  title?: string;
  /** e.g. `Are you sure you want to delete "Womans cloth"? This action cannot be undone.` */
  description: ReactNode;
  /** Extra callout shown below the description, e.g. dependency counts blocking the delete. */
  warning?: ReactNode;
  confirmLabel?: string;
  pendingLabel?: string;
  /** Performs the actual deletion (an API call). Throw/reject to signal failure. */
  onConfirm: () => Promise<void> | void;
  /** Called after a successful delete, once the dialog has closed — e.g. refetch a list or navigate away. */
  onSuccess?: () => void;
  /** Toast shown on success. Pass `false` to suppress it. */
  successMessage?: string | false;
  /** Fallback toast when the thrown error has no message. */
  errorMessage?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  warning,
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting...',
  onConfirm,
  onSuccess,
  successMessage = 'Deleted successfully',
  errorMessage = 'Failed to delete',
}: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onOpenChange(false);
      if (successMessage) toast.success(successMessage);
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (error as { message?: string })?.message;
      toast.error(message || errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {warning && (
          <div className="text-sm text-red-600 font-medium -mt-2">{warning}</div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {pendingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
