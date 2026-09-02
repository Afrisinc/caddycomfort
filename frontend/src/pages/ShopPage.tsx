import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { ShopProductGrid } from '@/components/shop/ShopProductGrid';
import { ShopPagination } from '@/components/shop/ShopPagination';
import { ShopGridSkeleton } from '@/components/shop/ShopGridSkeleton';
import { getShopProducts } from '@/lib/shop-data';
import { MAX_PRICE, PAGE_SIZE, SORT_OPTIONS } from '@/lib/shopFilters';
import { Category, Product } from '@/types/api';

export default function ShopPage() {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const categorySlug = searchParams.get('category') ?? undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sizes = searchParams.getAll('sizes');
  const colors = searchParams.getAll('colors');
  const sortKey = searchParams.get('sort') ?? 'featured';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Single request: the backend resolves categorySlug -> category and
        // filters products in the same round trip, instead of us awaiting
        // a category lookup before we can even ask for products.
        const sort = SORT_OPTIONS[sortKey] ?? SORT_OPTIONS.featured;

        const {
          products: fetchedProducts,
          pagination: fetchedPagination,
          category: fetchedCategory,
        } = await getShopProducts({
          categorySlug,
          minPrice: minPrice && minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice && maxPrice < MAX_PRICE ? maxPrice : undefined,
          sizes: sizes.length ? sizes : undefined,
          colors: colors.length ? colors : undefined,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
          page,
          limit: PAGE_SIZE,
        });

        if (cancelled) return;
        setCategory(fetchedCategory ?? null);
        setProducts(fetchedProducts);
        setPagination(fetchedPagination);
      } catch {
        if (cancelled) return;
        setCategory(null);
        setProducts([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

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
          <Suspense fallback={<ShopGridSkeleton />}>
            <ShopFilters categoryName={category?.name ?? null} totalCount={pagination.total}>
              {loading ? (
                <ShopGridSkeleton />
              ) : (
                <>
                  <ShopProductGrid products={products} />
                  <ShopPagination currentPage={page} totalPages={pagination.totalPages || 1} />
                </>
              )}
            </ShopFilters>
          </Suspense>
        </div>
      </div>

      <Footer />
    </>
  );
}
