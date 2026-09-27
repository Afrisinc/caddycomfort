import { CUSTOMER_STATUS_STYLES } from '@/lib/customerStatus';
import { cn } from '@/lib/utils';
import type { CustomerStatus } from '@/types/api';

export function CustomerStatusBadge({ status }: { readonly status: CustomerStatus }) {
  const style = CUSTOMER_STATUS_STYLES[status];
  return (
    <span
      className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', style.className)}
    >
      {style.label}
    </span>
  );
}
