import type { CustomerStatus } from '@/types/api';

export const CUSTOMER_STATUS_STYLES: Record<CustomerStatus, { label: string; className: string }> =
  {
    vip: {
      label: 'VIP',
      className: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
    },
    active: {
      label: 'Active',
      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    },
    inactive: { label: 'No orders yet', className: 'bg-muted text-muted-foreground' },
    suspended: {
      label: 'Suspended',
      className: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    },
  };

export const CUSTOMER_STATUSES = Object.keys(CUSTOMER_STATUS_STYLES) as CustomerStatus[];
