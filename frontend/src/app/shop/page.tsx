import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { ShopProductGrid } from '@/components/shop/ShopProductGrid';
import { ShopPagination } from '@/components/shop/ShopPagination';
import { getCategoryBySlug, getShopProducts } from '@/lib/shop-data';
import { MAX_PRICE, PAGE_SIZE, SORT_OPTIONS } from '@/lib/shopFilters';

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function all(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export const revalidate = 60;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const categorySlug = first(params.category);
  const minPrice = first(params.minPrice) ? Number(first(params.minPrice)) : undefined;
  const maxPrice = first(params.maxPrice) ? Number(first(params.maxPrice)) : undefined;
  const sizes = all(params.sizes);
  const colors = all(params.colors);
  const sortKey = first(params.sort) ?? 'featured';
  const page = first(params.page) ? Number(first(params.page)) : 1;

  const category = categorySlug ? await getCategoryBySlug(categorySlug) : null;
  const sort = SORT_OPTIONS[sortKey] ?? SORT_OPTIONS.featured;

  const { products, pagination } = await getShopProducts({
    categoryId: category?.id,
    minPrice: minPrice && minPrice > 0 ? minPrice : undefined,
    maxPrice: maxPrice && maxPrice < MAX_PRICE ? maxPrice : undefined,
    sizes: sizes.length ? sizes : undefined,
    colors: colors.length ? colors : undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-serif text-center mb-4">
              {category?.name || 'Shop Collection'}
            </h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Discover our curated selection of timeless pieces
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Suspense fallback={null}>
            <ShopFilters categoryName={category?.name ?? null} totalCount={pagination.total}>
              <ShopProductGrid products={products} />
              <ShopPagination currentPage={page} totalPages={pagination.totalPages || 1} />
            </ShopFilters>
          </Suspense>
        </div>
      </div>

      <Footer />
    </>
  );
}
