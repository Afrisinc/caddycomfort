'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDetailSkeleton } from '@/components/products/ProductDetailSkeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Minus,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { productsApi, wishlistApi, reviewsApi } from '@/lib/api';
import { toProductCardProps } from '@/lib/productCard';
import { Product, ProductReviewStats } from '@/types/api';
import { toast } from 'sonner';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const SWATCH_HEX: Record<string, string> = {
  Black: '#000000',
  White: '#FFFFFF',
  Red: '#DC2626',
  Blue: '#2563EB',
  Green: '#16A34A',
  Pink: '#EC4899',
  Tan: '#D2B48C',
  Brown: '#78350F',
  Cream: '#F5F0E6',
  Grey: '#6B7280',
  Navy: '#1E3A8A',
  Burgundy: '#7F1D1D',
};

function colorHex(name: string): string {
  return SWATCH_HEX[name] || '#9CA3AF';
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await productsApi.getById(id);
        setProduct(data);
        setSelectedSize(data.sizes[0] || '');
        setSelectedColor(data.colors[0] || '');

        const [related, reviews] = await Promise.all([
          productsApi
            .getAll({ categoryId: data.categoryId, isActive: true }, { limit: 5 })
            .then((r) => r.products.filter((p) => p.id !== data.id).slice(0, 4))
            .catch(() => []),
          reviewsApi.getProductReviews(data.id).catch(() => null),
        ]);
        setRelatedProducts(related);
        setReviewStats(reviews);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load product');
        router.push('/shop');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !product) {
      setIsWishlisted(false);
      return;
    }
    wishlistApi.checkProduct(product.id).then(setIsWishlisted).catch(() => {});
  }, [isAuthenticated, product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.imageUrl || product.images[0] || '',
      quantity,
      size: selectedSize,
      color: selectedColor,
    });

    toast.success('Added to cart');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist');
      router.push('/login');
      return;
    }
    try {
      setIsTogglingWishlist(true);
      if (isWishlisted) {
        await wishlistApi.removeByProductId(product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.add(product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <ProductDetailSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const images = product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const hasDiscount = product.comparePrice != null && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;
  const inStock = product.stockQuantity > 0;
  const averageRating = reviewStats?.stats.averageRating ?? 0;
  const reviewCount = reviewStats?.stats.totalReviews ?? 0;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
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
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {images[selectedImage] && (
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {hasDiscount && (
                  <Badge className="absolute top-4 right-4 bg-accent-rose">-{discountPct}%</Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index ? 'border-accent-rose' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2">{product.name}</h1>

                {reviewCount > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold">Rwf {product.price.toLocaleString()}</span>
                  {hasDiscount && (
                    <span className="text-lg text-muted-foreground line-through">
                      Rwf {product.comparePrice!.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {inStock ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500 text-red-500">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div>
                  <label className="text-sm font-semibold mb-3 block">
                    Color: {selectedColor && <span className="text-accent-rose">{selectedColor}</span>}
                  </label>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          selectedColor === color ? 'border-accent-rose scale-110' : 'border-gray-300 hover:border-accent-rose'
                        }`}
                        style={{ backgroundColor: colorHex(color) }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div>
                  <label className="text-sm font-semibold mb-3 block">
                    Size: {selectedSize && <span className="text-accent-rose">{selectedSize}</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={selectedSize === size ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[60px] ${selectedSize === size ? 'bg-accent-rose hover:bg-accent-rose-dark' : ''}`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-accent-rose hover:bg-accent-rose-dark"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" onClick={handleToggleWishlist} disabled={isTogglingWishlist}>
                  {isTogglingWishlist ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-accent-rose text-accent-rose' : ''}`} />
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-accent-rose" />
                  <div className="text-sm">
                    <p className="font-semibold">Free Shipping</p>
                    <p className="text-muted-foreground">On orders over Rwf 100,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent-rose" />
                  <div className="text-sm">
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-muted-foreground">100% secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-accent-rose" />
                  <div className="text-sm">
                    <p className="font-semibold">Easy Returns</p>
                    <p className="text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
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
                    <span className="font-medium text-foreground">Category:</span> {product.category?.name || 'Uncategorized'}
                  </li>
                  {product.sizes.length > 0 && (
                    <li>
                      <span className="font-medium text-foreground">Available sizes:</span> {product.sizes.join(', ')}
                    </li>
                  )}
                  {product.colors.length > 0 && (
                    <li>
                      <span className="font-medium text-foreground">Available colors:</span> {product.colors.join(', ')}
                    </li>
                  )}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {reviewCount === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reviews yet — be the first to review this product.</p>
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
                      We offer free standard shipping on all orders over Rwf 100,000. Orders are typically processed
                      within 1-2 business days and delivered within 5-7 business days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Return Policy</h4>
                    <p className="text-muted-foreground">
                      We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in their
                      original condition with all tags attached. Please contact our customer service team to initiate a return.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-serif mb-8 text-center">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} {...toProductCardProps(related)} href={`/shop/${related.id}`} />
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
