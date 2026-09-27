import { StatusPill } from '@/components/ui/status-pill';
import { CUSTOMER_STATUS_STYLES } from '@/lib/customerStatus';
import type { CustomerStatus } from '@/types/api';

export function CustomerStatusBadge({ status }: { readonly status: CustomerStatus }) {
  const style = CUSTOMER_STATUS_STYLES[status];
  return <StatusPill tone={style.tone}>{style.label}</StatusPill>;
}
