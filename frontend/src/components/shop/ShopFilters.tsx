import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from '@/router/compat';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SIZES, COLORS, MAX_PRICE } from '@/lib/shopFilters';
import { buildSearchUrl } from '@/lib/searchParamsUtil';

interface ShopFiltersProps {
  categoryName: string | null;
  totalCount: number;
  children: React.ReactNode;
}

export function ShopFilters({ categoryName, totalCount, children }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const minPrice = Number(searchParams.get('minPrice') ?? 0);
  const maxPrice = Number(searchParams.get('maxPrice') ?? MAX_PRICE);
  const selectedSizes = searchParams.getAll('sizes');
  const selectedColors = searchParams.getAll('colors');
  const sort = searchParams.get('sort') ?? 'featured';

  const [priceDraft, setPriceDraft] = useState([minPrice, maxPrice]);

  const navigate = (updates: Record<string, string | string[] | null>) => {
    router.push(buildSearchUrl(pathname, searchParams, { ...updates, page: null }));
  };

  const commitPrice = (value: number[]) => {
    navigate({
      minPrice: value[0] > 0 ? value[0].toString() : null,
      maxPrice: value[1] < MAX_PRICE ? value[1].toString() : null,
    });
  };

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    navigate({ sizes: next.length ? next : null });
  };

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    navigate({ colors: next.length ? next : null });
  };

  const clearFilters = () => {
    setPriceDraft([0, MAX_PRICE]);
    navigate({ minPrice: null, maxPrice: null, sizes: null, colors: null });
  };

  const clearCategory = () => {
    router.push('/shop');
  };

  const activeFiltersCount =
    selectedSizes.length + selectedColors.length + (minPrice > 0 || maxPrice < MAX_PRICE ? 1 : 0);

  const filterSectionContent = (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceDraft}
            onValueChange={setPriceDraft}
            onValueCommit={commitPrice}
            max={MAX_PRICE}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rwf {priceDraft[0].toLocaleString()}</span>
            <span>Rwf {priceDraft[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSize(size)}
              className={
                selectedSizes.includes(size) ? 'bg-accent-rose hover:bg-accent-rose-dark' : ''
              }
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Color</h3>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? 'border-accent-rose scale-110'
                  : 'border-gray-300 hover:border-accent-rose'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="text-sm text-accent-rose font-medium">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          {filterSectionContent}
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-accent-rose text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader className="border-b">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-4">{filterSectionContent}</div>
                <SheetFooter className="border-t pt-4">
                  <SheetClose asChild>
                    <Button className="w-full bg-accent-rose hover:bg-accent-rose-dark">
                      Show {totalCount} Result{totalCount === 1 ? '' : 's'}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalCount}</span> products found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={sort}
              onValueChange={(value) => navigate({ sort: value === 'featured' ? null : value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(activeFiltersCount > 0 || categoryName) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categoryName && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm">
                {categoryName}
                <button onClick={clearCategory}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {minPrice > 0 || maxPrice < MAX_PRICE ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm">
                Rwf {minPrice.toLocaleString()} - Rwf {maxPrice.toLocaleString()}
                <button
                  onClick={() => {
                    setPriceDraft([0, MAX_PRICE]);
                    navigate({ minPrice: null, maxPrice: null });
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}
            {selectedSizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm"
              >
                Size: {size}
                <button onClick={() => toggleSize(size)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedColors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm"
              >
                {color}
                <button onClick={() => toggleColor(color)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
