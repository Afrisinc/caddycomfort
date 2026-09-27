import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from '@/router/compat';
import { buildSearchUrl } from '@/lib/searchParamsUtil';
import { MAX_PRICE } from '@/lib/shopFilters';

type Updates = Record<string, string | string[] | null>;

export function useShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const minPrice = Number(searchParams.get('minPrice') ?? 0);
  const maxPrice = Number(searchParams.get('maxPrice') ?? MAX_PRICE);
  const sizes = searchParams.getAll('sizes');
  const colors = searchParams.getAll('colors');
  const sort = searchParams.get('sort') ?? 'featured';
  const hasPriceFilter = minPrice > 0 || maxPrice < MAX_PRICE;
  const activeCount = sizes.length + colors.length + (hasPriceFilter ? 1 : 0);

  const update = useCallback(
    (updates: Updates) =>
      router.push(buildSearchUrl(pathname, searchParams, { ...updates, page: null })),
    [router, pathname, searchParams],
  );

  const toggleIn = (list: string[], value: string) => {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    return next.length ? next : null;
  };

  return {
    minPrice,
    maxPrice,
    sizes,
    colors,
    sort,
    hasPriceFilter,
    activeCount,
    setSort: (value: string) => update({ sort: value === 'featured' ? null : value }),
    setPrice: ([min, max]: number[]) =>
      update({
        minPrice: min > 0 ? String(min) : null,
        maxPrice: max < MAX_PRICE ? String(max) : null,
      }),
    toggleSize: (size: string) => update({ sizes: toggleIn(sizes, size) }),
    toggleColor: (color: string) => update({ colors: toggleIn(colors, color) }),
    clearPrice: () => update({ minPrice: null, maxPrice: null }),
    clearSizes: () => update({ sizes: null }),
    clearColors: () => update({ colors: null }),
    clearAll: () => update({ minPrice: null, maxPrice: null, sizes: null, colors: null }),
    clearCategory: () => update({ category: null }),
  };
}

export type ShopFiltersState = ReturnType<typeof useShopFilters>;
