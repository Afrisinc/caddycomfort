import type { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FilterPanel } from '@/components/shop/FilterPanel';
import { ActiveFilters } from '@/components/shop/ActiveFilters';
import { useShopFilters } from '@/hooks/useShopFilters';
import { SORT_LABELS } from '@/lib/shopFilters';

interface ShopFiltersProps {
  readonly categoryName: string | null;
  readonly totalCount: number;
  readonly loading?: boolean;
  readonly children: ReactNode;
}

export function ShopFilters({ categoryName, totalCount, loading, children }: ShopFiltersProps) {
  const filters = useShopFilters();
  const resultLabel = `${totalCount.toLocaleString()} ${totalCount === 1 ? 'product' : 'products'}`;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <aside className="hidden w-64 shrink-0 lg:block" aria-label="Product filters">
        <div className="sticky top-28">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-base font-semibold">Filters</p>
            {filters.activeCount > 0 && (
              <button
                type="button"
                onClick={filters.clearAll}
                className="rounded text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent-rose/40"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterPanel filters={filters} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {filters.activeCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-rose px-1.5 text-[11px] font-semibold text-white">
                      {filters.activeCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col gap-0 p-0">
                <SheetHeader className="border-b px-5 py-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <FilterPanel filters={filters} />
                </div>
                <SheetFooter className="flex-row gap-3 border-t px-5 py-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={filters.clearAll}
                    disabled={filters.activeCount === 0}
                  >
                    Clear all
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1 bg-accent-rose hover:bg-accent-rose-dark">
                      Show {resultLabel}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <p className="hidden text-sm text-muted-foreground sm:block" aria-live="polite">
              {loading ? 'Loading products…' : resultLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="hidden text-sm text-muted-foreground sm:block">
              Sort by
            </label>
            <Select value={filters.sort} onValueChange={filters.setSort}>
              <SelectTrigger id="shop-sort" className="h-10 w-44" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground sm:hidden" aria-live="polite">
          {loading ? 'Loading products…' : resultLabel}
        </p>

        <ActiveFilters filters={filters} categoryName={categoryName} />

        {children}
      </div>
    </div>
  );
}
