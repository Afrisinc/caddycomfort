import { X } from 'lucide-react';
import { formatRwf } from '@/lib/pricing';
import { MAX_PRICE } from '@/lib/shopFilters';
import type { ShopFiltersState } from '@/hooks/useShopFilters';

interface FilterChipProps {
  readonly label: string;
  readonly onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-full border bg-background pr-1 pl-3 text-sm">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

interface ActiveFiltersProps {
  readonly filters: ShopFiltersState;
  readonly categoryName: string | null;
}

export function ActiveFilters({ filters, categoryName }: ActiveFiltersProps) {
  if (filters.activeCount === 0 && !categoryName) return null;

  const priceLabel = `${formatRwf(filters.minPrice)} – ${
    filters.maxPrice >= MAX_PRICE ? `${formatRwf(MAX_PRICE)}+` : formatRwf(filters.maxPrice)
  }`;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {categoryName && <FilterChip label={categoryName} onRemove={filters.clearCategory} />}
      {filters.hasPriceFilter && <FilterChip label={priceLabel} onRemove={filters.clearPrice} />}
      {filters.sizes.map((size) => (
        <FilterChip key={size} label={`Size ${size}`} onRemove={() => filters.toggleSize(size)} />
      ))}
      {filters.colors.map((color) => (
        <FilterChip key={color} label={color} onRemove={() => filters.toggleColor(color)} />
      ))}
      {filters.activeCount > 1 && (
        <button
          type="button"
          onClick={filters.clearAll}
          className="ml-1 rounded text-sm font-medium text-accent-rose underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent-rose/40"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
