import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface UnsavedChangesGuardProps {
  readonly when: boolean;
}

export function UnsavedChangesGuard({ when }: UnsavedChangesGuardProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onOpenChange={(open) => !open && blocker.reset?.()}
      tone="warning"
      title="Discard unsaved changes?"
      description="You’ve made changes that haven’t been saved. If you leave now, they’ll be lost."
      cancelLabel="Keep editing"
      confirmLabel="Discard"
      onConfirm={() => blocker.proceed?.()}
    />
  );
}
