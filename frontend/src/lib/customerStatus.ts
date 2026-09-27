import type { StatusTone } from '@/components/ui/status-pill';
import type { CustomerStatus } from '@/types/api';

export const CUSTOMER_STATUS_STYLES: Record<CustomerStatus, { label: string; tone: StatusTone }> = {
  vip: { label: 'VIP', tone: 'violet' },
  active: { label: 'Active', tone: 'green' },
  inactive: { label: 'No orders yet', tone: 'neutral' },
  suspended: { label: 'Suspended', tone: 'red' },
};

export const CUSTOMER_STATUSES = Object.keys(CUSTOMER_STATUS_STYLES) as CustomerStatus[];
