import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductInfoPanel } from '@/components/products/ProductInfoPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star, Check } from 'lucide-react';
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

export default function ShopProductPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
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

  if (loading) return null;
  if (!product) return <NotFoundPage />;

  const images =
    product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const hasDiscount = product.comparePrice != null && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;
  const averageRating = reviewStats?.stats.averageRating ?? 0;
  const reviewCount = reviewStats?.stats.totalReviews ?? 0;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
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
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/shop?category=${product.category.slug}`}>
                      {product.category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            <ProductGallery
              images={images}
              name={product.name}
              hasDiscount={hasDiscount}
              discountPct={discountPct}
            />
            <ProductInfoPanel
              product={product}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          </div>

          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-serif mb-4">Product Details</h3>
                <p className="text-muted-foreground mb-6">{product.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">SKU:</span> {product.sku}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Category:</span>{' '}
                    {product.category?.name || 'Uncategorized'}
                  </li>
                  {product.sizes.length > 0 && (
                    <li>
                      <span className="font-medium text-foreground">Available sizes:</span>{' '}
                      {product.sizes.join(', ')}
                    </li>
                  )}
                  {product.colors.length > 0 && (
                    <li>
                      <span className="font-medium text-foreground">Available colors:</span>{' '}
                      {product.colors.join(', ')}
                    </li>
                  )}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {reviewCount === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet — be the first to review this product.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                      <div>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{reviewCount} reviews</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {reviewStats!.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">
                                  {review.user.name || review.user.firstName || 'Customer'}
                                </span>
                                {review.isVerified && (
                                  <Badge variant="outline" className="text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-serif mb-4">Shipping & Returns</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Information</h4>
                    <p className="text-muted-foreground">
                      We offer free standard shipping on all orders over Rwf 100,000. Orders are
                      typically processed within 1-2 business days and delivered within 5-7 business
                      days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Return Policy</h4>
                    <p className="text-muted-foreground">
                      We accept returns within 30 days of delivery. Items must be unworn, unwashed,
                      and in their original condition with all tags attached. Please contact our
                      customer service team to initiate a return.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-serif mb-8 text-center">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <ProductCard
                    key={related.id}
                    {...toProductCardProps(related)}
                    href={`/shop/${related.id}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
