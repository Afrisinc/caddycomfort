export interface StoreSettings {
  storeName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  openingHours: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  taxRate: number;
  codDepositPercent: number;
  updatedAt?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'CaddyComfort',
  description: 'Premium fashion and lifestyle products',
  email: 'caddyumutoniwase@gmail.com',
  phone: '+250 786 763 654',
  address: 'KN 4 Ave, Kigali, Rwanda',
  openingHours: 'Mon–Sat: 9AM–8PM',
  standardShippingFee: 5000,
  freeShippingThreshold: 100000,
  taxRate: 18,
  codDepositPercent: 50,
};

const rwf = (amount: number) => `Rwf ${Math.round(amount).toLocaleString()}`;

export function freeShippingText(settings: StoreSettings): string {
  return `On orders over ${rwf(settings.freeShippingThreshold)}`;
}

export function cashOnDeliveryText(settings: StoreSettings): string {
  const percent = settings.codDepositPercent;
  if (percent <= 0) return 'Pay the full amount in cash when your order arrives.';
  if (percent >= 100) return 'Pay the full amount online when you order, by Mobile Money or card.';
  return `Pay a ${percent}% deposit online when you order, by Mobile Money or card, and the remaining ${100 - percent}% in cash when your order arrives. Nothing is owed after delivery.`;
}

export type SettingsErrors = Partial<Record<keyof StoreSettings, string>>;

const NUMBER_RULES: Partial<Record<keyof StoreSettings, [number, number]>> = {
  standardShippingFee: [0, 1_000_000],
  freeShippingThreshold: [0, 100_000_000],
  taxRate: [0, 100],
  codDepositPercent: [0, 100],
};

export function validateSettings(values: StoreSettings): SettingsErrors {
  const errors: SettingsErrors = {};
  if (!values.storeName.trim()) errors.storeName = 'Store name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (!values.phone.trim()) errors.phone = 'Phone number is required';
  if (!values.address.trim()) errors.address = 'Address is required';
  for (const [field, [min, max]] of Object.entries(NUMBER_RULES) as [
    keyof StoreSettings,
    [number, number],
  ][]) {
    const value = Number(values[field]);
    if (!Number.isFinite(value) || value < min || value > max) {
      errors[field] = `Enter a number between ${min.toLocaleString()} and ${max.toLocaleString()}`;
    }
  }
  return errors;
}
