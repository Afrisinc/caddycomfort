import type { Product } from '@/types/api';

export interface ProductPricing {
  current: number;
  original: number | null;
  discountPct: number;
}

type PricedProduct = Pick<Product, 'price' | 'salePrice' | 'comparePrice'>;

export function getProductPricing(product: PricedProduct): ProductPricing {
  const current = product.salePrice || product.price;
  const reference = Math.max(product.price, product.comparePrice ?? 0);
  const original = reference > current ? reference : null;
  const discountPct = original ? Math.round(((original - current) / original) * 100) : 0;
  return { current, original, discountPct };
}

export function formatRwf(amount: number): string {
  return `Rwf ${Math.round(amount).toLocaleString()}`;
}

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatRwfCompact(amount: number): string {
  return `Rwf ${compactNumber.format(Math.round(amount))}`;
}

export const LOW_STOCK_THRESHOLD = 5;
