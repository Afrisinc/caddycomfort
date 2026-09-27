import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/router/compat';
import Link from '@/components/common/Link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChipGroup, SwatchGroup } from '@/components/ui/option-group';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { FeatureItem, Heading } from '@/components/ui/typography';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { RatingStars } from '@/components/products/RatingStars';
import { StockStatus } from '@/components/products/StockStatus';
import {
  Check,
  Heart,
  Loader2,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlist } from '@/hooks/useWishlist';
import { formatRwf, getProductPricing } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { Product } from '@/types/api';
import { toast } from 'sonner';
import { useStoreSettings } from '@/store/useSettingsStore';
import { freeShippingText } from '@/lib/storeSettings';

interface ProductInfoPanelProps {
  readonly product: Product;
  readonly averageRating: number;
  readonly reviewCount: number;
  readonly onViewReviews?: () => void;
}

export function ProductInfoPanel({
  product,
  averageRating,
  reviewCount,
  onViewReviews,
}: ProductInfoPanelProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const wishlist = useWishlist();
  const isWishlisted = wishlist.isSaved(product.id);
  const isTogglingWishlist = wishlist.isPending(product.id);

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const pricing = getProductPricing(product);
  const settings = useStoreSettings();
  const inStock = product.stockQuantity > 0;

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: pricing.current,
      image: product.imageUrl || product.images[0] || '',
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    setJustAdded(true);
    toast.success(`${product.name} added to cart`, {
      action: { label: 'View cart', onClick: () => router.push('/cart') },
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const addToCartLabel = () => {
    if (!inStock) return 'Out of stock';
    if (justAdded) return 'Added to cart';
    return 'Add to cart';
  };

  return (
    <div className="space-y-7">
      <div className="space-y-4">
        {product.category && (
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-accent-rose transition-colors hover:text-accent-rose-dark"
          >
            {product.category.name}
          </Link>
        )}
        <Heading as="h1" size="xl" className="leading-tight">
          {product.name}
        </Heading>

        {reviewCount > 0 && (
          <button
            type="button"
            onClick={onViewReviews}
            className="group flex items-center gap-2 rounded text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40"
          >
            <RatingStars rating={averageRating} />
            <span className="font-medium tabular-nums">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground underline-offset-4 group-hover:text-foreground group-hover:underline">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </button>
        )}

        <div className="space-y-2 pt-1">
          <PriceDisplay pricing={pricing} size="lg" />
          <StockStatus quantity={product.stockQuantity} />
        </div>
      </div>

      <Separator />

      {(product.colors.length > 0 || product.sizes.length > 0) && (
        <div className="space-y-6">
          {product.colors.length > 0 && (
            <SwatchGroup
              label="Color"
              value={selectedColor}
              onValueChange={setSelectedColor}
              options={product.colors}
            />
          )}
          {product.sizes.length > 0 && (
            <ChipGroup
              label="Size"
              value={selectedSize}
              onValueChange={setSelectedSize}
              options={product.sizes}
            />
          )}
        </div>
      )}

      <div ref={ctaRef} className="space-y-3">
        <p className="text-sm font-medium">Quantity</p>
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            max={Math.max(1, product.stockQuantity)}
            disabled={!inStock}
          />
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              'h-11 min-w-44 flex-1 gap-2 text-[15px] transition-colors',
              justAdded
                ? 'bg-emerald-600 hover:bg-emerald-600'
                : 'bg-accent-rose hover:bg-accent-rose-dark',
            )}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {addToCartLabel()}
          </Button>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => wishlist.toggle(product)}
              disabled={isTogglingWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={isWishlisted}
              className="h-11 w-11"
            >
              {isTogglingWishlist ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isWishlisted && 'fill-accent-rose text-accent-rose',
                  )}
                />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleShare}
              aria-label="Share product"
              className="h-11 w-11"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border bg-muted/30 p-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <FeatureItem icon={Truck} title="Free shipping" description={freeShippingText(settings)} />
        <FeatureItem icon={ShieldCheck} title="Secure payment" description="Protected checkout" />
        <FeatureItem icon={RotateCcw} title="Easy returns" description="30-day return policy" />
      </div>

      <div
        aria-hidden={!showStickyBar}
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur transition-transform duration-300 lg:hidden',
          showStickyBar ? 'translate-y-0' : 'pointer-events-none translate-y-full',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-sm font-semibold tabular-nums">{formatRwf(pricing.current)}</p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!inStock}
            tabIndex={showStickyBar ? 0 : -1}
            className={cn(
              'h-11 gap-2 px-5',
              justAdded
                ? 'bg-emerald-600 hover:bg-emerald-600'
                : 'bg-accent-rose hover:bg-accent-rose-dark',
            )}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {addToCartLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}
