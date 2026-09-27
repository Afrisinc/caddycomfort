import type { StoreSettings } from '@prisma/client';
import prisma from '../config/database';
import { CACHE_TTL, cache } from '../utils/cache';

export type SettingsInput = Partial<Omit<StoreSettings, 'id' | 'updatedAt'>>;

const DEFAULTS: Omit<StoreSettings, 'id' | 'updatedAt'> = {
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

const TEXT_FIELDS = [
  'storeName',
  'description',
  'email',
  'phone',
  'address',
  'openingHours',
] as const;
const REQUIRED_TEXT = new Set(['storeName', 'email', 'phone', 'address']);
const NUMBER_LIMITS = {
  standardShippingFee: [0, 1_000_000],
  freeShippingThreshold: [0, 100_000_000],
  taxRate: [0, 100],
  codDepositPercent: [0, 100],
} as const;

export class SettingsValidationError extends Error {}

function sanitize(input: Record<string, unknown>): SettingsInput {
  const data: SettingsInput = {};

  for (const field of TEXT_FIELDS) {
    if (input[field] === undefined) continue;
    const value = String(input[field]).trim();
    if (REQUIRED_TEXT.has(field) && !value) {
      throw new SettingsValidationError(`${field} is required`);
    }
    data[field] = value;
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    throw new SettingsValidationError('email must be a valid email address');
  }

  for (const [field, [min, max]] of Object.entries(NUMBER_LIMITS)) {
    if (input[field] === undefined) continue;
    const value = Number(input[field]);
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new SettingsValidationError(`${field} must be between ${min} and ${max}`);
    }
    data[field as keyof typeof NUMBER_LIMITS] = value;
  }

  return data;
}

export class SettingsService {
  static get(): Promise<StoreSettings> {
    return cache.getOrSet('settings', ['store'], CACHE_TTL.long, () =>
      prisma.storeSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...DEFAULTS },
        update: {},
      }),
    );
  }

  static async update(input: Record<string, unknown>): Promise<StoreSettings> {
    const data = sanitize(input);
    const settings = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...DEFAULTS, ...data },
      update: data,
    });
    await cache.invalidate('settings');
    return settings;
  }

  static calculateCharges(
    settings: Pick<StoreSettings, 'standardShippingFee' | 'freeShippingThreshold' | 'taxRate'>,
    {
      subtotal,
      discount,
      freeShipping,
    }: { subtotal: number; discount: number; freeShipping: boolean },
  ) {
    const shippingCost =
      freeShipping || subtotal > settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    const tax = (subtotal - discount) * (settings.taxRate / 100);
    return { shippingCost, tax, total: subtotal - discount + shippingCost + tax };
  }
}
