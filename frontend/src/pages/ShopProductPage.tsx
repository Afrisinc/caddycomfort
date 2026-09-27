import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductInfoPanel } from '@/components/products/ProductInfoPanel';
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ContentSection,
  DetailList,
  Heading,
  InfoBlock,
  SectionHeader,
  Text,
} from '@/components/ui/typography';
import { ProductDetailSkeleton } from '@/components/products/ProductDetailSkeleton';
import { getProductPricing } from '@/lib/pricing';
import { RatingStars } from '@/components/products/RatingStars';
import Link from '@/components/common/Link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, FileText, MessageSquare, RotateCcw, Truck } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getProductById, getRelatedProducts, getProductReviews } from '@/lib/shop-data';
import { toProductCardProps } from '@/lib/productCard';
import { Product, ProductReviewStats } from '@/types/api';
import NotFoundPage from '@/pages/NotFoundPage';
import { Seo, SITE_URL } from '@/components/common/Seo';

export default function ShopProductPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [activeTab, setActiveTab] = useState('description');

  const viewReviews = () => {
    setActiveTab('reviews');
    document.getElementById('product-details')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setActiveTab('description');
      const fetchedProduct = await getProductById(id);

      if (cancelled) return;

      if (!fetchedProduct) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const [fetchedRelated, fetchedReviews] = await Promise.all([
        getRelatedProducts(fetchedProduct.categoryId, fetchedProduct.id).catch(() => []),
        getProductReviews(fetchedProduct.id).catch(() => null),
      ]);

      if (cancelled) return;
      setProduct(fetchedProduct);
      setRelatedProducts(fetchedRelated);
      setReviewStats(fetchedReviews);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20">
          <ProductDetailSkeleton />
        </main>
        <Footer />
      </>
    );
  }
  if (!product) return <NotFoundPage />;

  const images =
    product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const pricing = getProductPricing(product);
  const averageRating = reviewStats?.stats.averageRating ?? 0;
  const reviewCount = reviewStats?.stats.totalReviews ?? 0;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: images,
    ...(product.category && { category: product.category.name }),
    brand: { '@type': 'Brand', name: 'CaddyComfort' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/shop/${product.id}`,
      priceCurrency: 'RWF',
      price: pricing.current,
      availability:
        product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount,
      },
    }),
  };

  return (
    <>
      <Seo
        title={product.name}
        description={product.description}
        image={images[0]}
        type="product"
        jsonLd={productJsonLd}
      />
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-8 lg:pb-24">
          <Breadcrumb className="mb-6 lg:mb-8">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="hidden sm:inline-flex">
                    <BreadcrumbLink href={`/shop?category=${product.category.slug}`}>
                      {product.category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:inline-flex" />
                </>
              )}
              {!product.category && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-16 grid grid-cols-1 gap-8 lg:mb-24 lg:grid-cols-2 lg:gap-14 xl:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ProductGallery
                images={images}
                name={product.name}
                hasDiscount={pricing.discountPct > 0}
                discountPct={pricing.discountPct}
              />
            </div>
            <ProductInfoPanel
              key={product.id}
              product={product}
              averageRating={averageRating}
              reviewCount={reviewCount}
              onViewReviews={viewReviews}
            />
          </div>

          <Tabs
            id="product-details"
            value={activeTab}
            onValueChange={setActiveTab}
            variant="underline"
            className="scroll-mt-28"
          >
            <TabsList aria-label="Product information">
              <TabsTrigger value="description">
                <FileText />
                Description
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <MessageSquare />
                Reviews
                <TabsCount>{reviewCount}</TabsCount>
              </TabsTrigger>
              <TabsTrigger value="shipping">
                <Truck />
                Shipping & Returns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
                <ContentSection title="About this product">
                  <Text variant="lead" className="whitespace-pre-line">
                    {product.description}
                  </Text>
                </ContentSection>
                <ContentSection title="Details">
                  <DetailList
                    items={[
                      { label: 'SKU', value: product.sku },
                      { label: 'Category', value: product.category?.name || 'Uncategorized' },
                      ...(product.sizes.length > 0
                        ? [{ label: 'Sizes', value: product.sizes.join(', ') }]
                        : []),
                      ...(product.colors.length > 0
                        ? [{ label: 'Colors', value: product.colors.join(', ') }]
                        : []),
                    ]}
                  />
                </ContentSection>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              {reviewCount === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose">
                    <MessageSquare className="h-6 w-6" />
                  </span>
                  <Heading as="h3" size="sm">
                    No reviews yet
                  </Heading>
                  <Text variant="small" className="mt-1.5">
                    Be the first to share your thoughts on this product.
                  </Text>
                </div>
              ) : (
                <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
                  <div className="h-fit rounded-2xl border bg-card p-6 text-center lg:sticky lg:top-24">
                    <p className="font-serif text-5xl font-semibold tabular-nums">
                      {averageRating.toFixed(1)}
                    </p>
                    <RatingStars rating={averageRating} size="md" className="mt-3 justify-center" />
                    <Text variant="small" className="mt-2">
                      Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </Text>
                  </div>
                  <ul className="divide-y">
                    {reviewStats!.reviews.map((review) => {
                      const author = review.user.name || review.user.firstName || 'Customer';
                      return (
                        <li key={review.id} className="py-6 first:pt-0 last:pb-0">
                          <div className="flex items-start gap-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
                              {author.charAt(0)}
                            </span>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold">{author}</span>
                                  {review.isVerified && (
                                    <Badge
                                      variant="outline"
                                      className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    >
                                      <Check className="h-3 w-3" />
                                      Verified purchase
                                    </Badge>
                                  )}
                                </div>
                                <time
                                  dateTime={review.createdAt}
                                  className="text-xs text-muted-foreground"
                                >
                                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </time>
                              </div>
                              <RatingStars rating={review.rating} />
                              {review.comment && <Text>{review.comment}</Text>}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="shipping">
              <ContentSection
                title="Shipping & Returns"
                description="Everything you need to know about delivery and returns."
                action={
                  <Link
                    href="/shipping"
                    className="text-sm font-medium text-accent-rose underline-offset-4 hover:underline"
                  >
                    Full shipping policy →
                  </Link>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBlock icon={Truck} title="Shipping information">
                    We offer free standard shipping on all orders over Rwf 100,000. Orders are
                    typically processed within 1-2 business days and delivered within 5-7 business
                    days.
                  </InfoBlock>
                  <InfoBlock icon={RotateCcw} title="Return policy">
                    We accept returns within 30 days of delivery. Items must be unworn, unwashed,
                    and in their original condition with all tags attached. Please contact our
                    customer service team to initiate a return.
                  </InfoBlock>
                </div>
              </ContentSection>
            </TabsContent>
          </Tabs>

          {relatedProducts.length > 0 && (
            <section className="mt-20 border-t pt-16 lg:mt-24 lg:pt-20">
              <SectionHeader
                eyebrow="Complete the look"
                title="You may also like"
                className="mb-8 lg:mb-10"
                action={
                  product.category && (
                    <Link
                      href={`/shop?category=${product.category.slug}`}
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent-rose"
                    >
                      View all {product.category.name}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )
                }
              />
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {relatedProducts.map((related) => (
                  <ProductCard
                    key={related.id}
                    {...toProductCardProps(related)}
                    href={`/shop/${related.id}`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
