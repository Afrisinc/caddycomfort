import type { StoreSettings } from '@/lib/storeSettings';

export type SettingsField = keyof StoreSettings;

export interface FieldConfig {
  name: SettingsField;
  label: string;
  kind: 'text' | 'email' | 'tel' | 'textarea' | 'number';
  prefix?: string;
  suffix?: string;
  hint?: string;
  wide?: boolean;
  required?: boolean;
}

export interface SectionConfig {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
}

export const SETTINGS_SECTIONS: SectionConfig[] = [
  {
    id: 'store',
    title: 'Store details',
    description: 'Shown on the Contact, About, FAQ and Shipping pages.',
    fields: [
      { name: 'storeName', label: 'Store name', kind: 'text', required: true },
      { name: 'email', label: 'Email', kind: 'email', required: true },
      { name: 'phone', label: 'Phone', kind: 'tel', required: true },
      { name: 'openingHours', label: 'Opening hours', kind: 'text', hint: 'e.g. Mon–Sat: 9AM–8PM' },
      { name: 'address', label: 'Address', kind: 'text', required: true, wide: true },
      { name: 'description', label: 'Description', kind: 'textarea', wide: true },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping & tax',
    description: 'Used to calculate every new order and shown in the cart and checkout.',
    fields: [
      {
        name: 'standardShippingFee',
        label: 'Standard shipping fee',
        kind: 'number',
        prefix: 'Rwf',
      },
      { name: 'freeShippingThreshold', label: 'Free shipping over', kind: 'number', prefix: 'Rwf' },
      {
        name: 'taxRate',
        label: 'Tax rate',
        kind: 'number',
        suffix: '%',
        hint: 'Added on top of the subtotal after discounts',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'How cash on delivery works for new orders.',
    fields: [
      {
        name: 'codDepositPercent',
        label: 'Cash on delivery deposit',
        kind: 'number',
        suffix: '%',
        hint: 'Paid online when ordering. Use 0 for pure cash on delivery.',
      },
    ],
  },
];
