import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { ChipToggleGroup, SwatchToggleGroup } from '@/components/ui/option-group';
import { FilterSection } from '@/components/shop/FilterSection';
import { formatRwf } from '@/lib/pricing';
import { COLORS, MAX_PRICE, SIZES } from '@/lib/shopFilters';
import type { ShopFiltersState } from '@/hooks/useShopFilters';

interface FilterPanelProps {
  readonly filters: ShopFiltersState;
}

export function FilterPanel({ filters }: FilterPanelProps) {
  const [priceDraft, setPriceDraft] = useState([filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    setPriceDraft([filters.minPrice, filters.maxPrice]);
  }, [filters.minPrice, filters.maxPrice]);

  return (
    <div>
      <FilterSection
        title="Price"
        count={filters.hasPriceFilter ? 1 : 0}
        onClear={filters.clearPrice}
      >
        <Slider
          value={priceDraft}
          onValueChange={setPriceDraft}
          onValueCommit={filters.setPrice}
          max={MAX_PRICE}
          step={10000}
          minStepsBetweenThumbs={1}
          aria-label="Price range"
          className="py-2"
        />
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <span className="rounded-md border bg-background px-2.5 py-1.5 font-medium tabular-nums">
            {formatRwf(priceDraft[0])}
          </span>
          <span className="h-px flex-1 bg-border" />
          <span className="rounded-md border bg-background px-2.5 py-1.5 font-medium tabular-nums">
            {priceDraft[1] >= MAX_PRICE ? `${formatRwf(MAX_PRICE)}+` : formatRwf(priceDraft[1])}
          </span>
        </div>
      </FilterSection>

      <FilterSection title="Size" count={filters.sizes.length} onClear={filters.clearSizes}>
        <ChipToggleGroup
          label="Size"
          values={filters.sizes}
          onToggle={filters.toggleSize}
          options={SIZES}
        />
      </FilterSection>

      <FilterSection title="Color" count={filters.colors.length} onClear={filters.clearColors}>
        <SwatchToggleGroup
          label="Color"
          values={filters.colors}
          onToggle={filters.toggleColor}
          options={COLORS}
        />
      </FilterSection>
    </div>
  );
}
