import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { CtaBanner } from '@/components/common/CtaBanner';
import { PageSection } from '@/components/common/PageSection';
import { ScrollRow } from '@/components/common/ScrollRow';
import { HeroBanner } from '@/components/sections/HeroBanner';
import { NewsletterSection } from '@/components/sections/NewsletterSection';
import { CategoryCardV2 } from '@/components/products/CategoryCardV2';
import { CategoryCardSkeleton } from '@/components/products/CategoryCardSkeleton';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { ProductListItem } from '@/components/products/ProductListItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { useWishlist } from '@/hooks/useWishlist';
import { HERO_SLIDES, PROMO_CATEGORIES } from '@/lib/homeContent';
import { toProductCardProps } from '@/lib/productCard';
import {
  getFeaturedProducts,
  getFlashSaleProducts,
  getHomeCategories,
  getMostSellingProducts,
} from '@/lib/server-data';
import type { Category, Product } from '@/types/api';

const NO_CATEGORIES: Category[] = [];
const NO_PRODUCTS: Product[] = [];

function ShopAllLink({ href = '/shop', label }: Readonly<{ href?: string; label: string }>) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent-rose"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function ProductRow({
  label,
  products,
  loading,
}: Readonly<{ label: string; products: Product[]; loading: boolean }>) {
  const quickAdd = useQuickAdd();
  const wishlist = useWishlist();

  if (loading) {
    return (
      <ScrollRow label={label}>
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </ScrollRow>
    );
  }

  return (
    <ScrollRow label={label}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...toProductCardProps(product)}
          href={`/shop/${product.id}`}
          onAddToCart={() => quickAdd(product)}
          isWishlisted={wishlist.isSaved(product.id)}
          onWishlist={() => wishlist.toggle(product)}
        />
      ))}
    </ScrollRow>
  );
}

export default function HomePage() {
  const categories = useAsyncData(getHomeCategories, NO_CATEGORIES);
  const featured = useAsyncData(getFeaturedProducts, NO_PRODUCTS);
  const bestSellers = useAsyncData(getMostSellingProducts, NO_PRODUCTS);
  const flashSale = useAsyncData(getFlashSaleProducts, NO_PRODUCTS);

  const show = (state: { loading: boolean; data: unknown[] }) =>
    state.loading || state.data.length > 0;

  return (
    <>
      <Navbar />

      <main>
        <h1 className="sr-only">CaddyComfort — luxury fashion in Kigali</h1>

        <HeroBanner slides={HERO_SLIDES} />

        {show(categories) && (
          <PageSection
            eyebrow="Categories"
            title="Shop by category"
            description="Discover our wide range of fashion categories to find your perfect style."
            action={<ShopAllLink label="Shop all" />}
          >
            <ScrollRow label="Categories">
              {categories.loading
                ? Array.from({ length: 4 }, (_, i) => <CategoryCardSkeleton key={i} />)
                : categories.data.map((category) => (
                    <CategoryCardV2
                      key={category.id}
                      title={category.name}
                      href={`/shop?category=${category.slug}`}
                      image={category.image || undefined}
                    />
                  ))}
            </ScrollRow>
          </PageSection>
        )}

        {show(featured) && (
          <PageSection
            className="pt-0 md:pt-0"
            eyebrow="Featured"
            title="Featured products"
            description="Discover our curated selection of premium fashion pieces."
            action={<ShopAllLink label="View all" />}
          >
            <ProductRow
              label="Featured products"
              products={featured.data}
              loading={featured.loading}
            />
          </PageSection>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CtaBanner
            eyebrow="Trending products"
            title="Get discounts on our products"
            description={
              <ul className="flex flex-wrap gap-2 pt-2">
                {PROMO_CATEGORIES.map((category) => (
                  <li key={category.href}>
                    <Link
                      href={category.href}
                      className="inline-flex h-9 items-center rounded-full border bg-background px-4 text-sm font-medium text-foreground transition-colors outline-none hover:border-accent-rose/40 hover:text-accent-rose focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            }
            actions={
              <Button
                asChild
                size="lg"
                className="h-11 gap-2 bg-accent-rose hover:bg-accent-rose-dark"
              >
                <Link href="/shop">
                  Check discounts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
            media={
              <div className="relative h-52 md:h-72">
                <Image
                  src="/new-images/png/bag-1.png"
                  alt="Handbag from the CaddyComfort collection"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain object-bottom"
                />
              </div>
            }
          />
        </div>

        {show(bestSellers) && (
          <PageSection
            eyebrow="Most popular"
            title="Best sellers"
            action={<ShopAllLink label="Shop all" />}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.loading
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))
                : bestSellers.data.map((product, i) => (
                    <ProductListItem key={product.id} product={product} rank={i + 1} />
                  ))}
            </div>
          </PageSection>
        )}

        {show(flashSale) && (
          <PageSection
            className="pt-0 md:pt-0"
            eyebrow="Flash sale"
            title="On sale now"
            description="Don't miss out on these deals."
            action={<ShopAllLink label="View all" />}
          >
            <ProductRow
              label="Products on sale"
              products={flashSale.data}
              loading={flashSale.loading}
            />
          </PageSection>
        )}

        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}
