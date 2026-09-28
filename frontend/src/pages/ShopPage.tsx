import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
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
  const navigate = useNavigate();

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

  const hasFilters =
    sizes.length > 0 ||
    colors.length > 0 ||
    (minPrice !== undefined && minPrice > 0) ||
    (maxPrice !== undefined && maxPrice < MAX_PRICE);

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (categorySlug) next.set('category', categorySlug);
    const qs = next.toString();
    navigate(qs ? `/shop?${qs}` : '/shop');
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        <PageHeader
          title={category?.name || 'Shop all'}
          description={
            category?.description ||
            'Pieces made for comfort and confidence, from your workout to the rest of your day.'
          }
          breadcrumbs={[
            { label: 'Home', href: '/' },
            ...(category
              ? [{ label: 'Shop', href: '/shop' }, { label: category.name }]
              : [{ label: 'Shop' }]),
          ]}
        />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8 lg:pb-24">
          <ShopFilters
            categoryName={category?.name ?? null}
            totalCount={pagination.total}
            loading={loading}
          >
            {loading ? (
              <ShopGridSkeleton />
            ) : (
              <>
                <ShopProductGrid
                  products={products}
                  hasFilters={hasFilters}
                  onClearFilters={clearFilters}
                />
                <ShopPagination currentPage={page} totalPages={pagination.totalPages || 1} />
              </>
            )}
          </ShopFilters>
        </div>
      </main>

      <Footer />
    </>
  );
}
