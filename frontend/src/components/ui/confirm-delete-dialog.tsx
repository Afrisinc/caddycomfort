import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog, ConfirmNotice } from '@/components/ui/confirm-dialog';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: ReactNode;
  warning?: ReactNode;
  blocked?: boolean;
  confirmLabel?: string;
  pendingLabel?: string;
  onConfirm: () => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string | false;
  errorMessage?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  warning,
  blocked = false,
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting…',
  onConfirm,
  onSuccess,
  successMessage = 'Deleted successfully',
  errorMessage = 'Failed to delete',
}: Readonly<ConfirmDeleteDialogProps>) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
      if (successMessage) toast.success(successMessage);
      onSuccess?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : (error as { message?: string })?.message;
      toast.error(message || errorMessage);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      pendingLabel={pendingLabel}
      blocked={blocked}
      onConfirm={handleConfirm}
    >
      {warning && <ConfirmNotice>{warning}</ConfirmNotice>}
    </ConfirmDialog>
  );
}
