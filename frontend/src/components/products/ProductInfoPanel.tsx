import { useEffect, useState } from 'react';
import { useRouter } from '@/router/compat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { wishlistApi } from '@/lib/api';
import { Product } from '@/types/api';
import { toast } from 'sonner';

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

interface ProductInfoPanelProps {
  product: Product;
  averageRating: number;
  reviewCount: number;
}

export function ProductInfoPanel({ product, averageRating, reviewCount }: ProductInfoPanelProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsWishlisted(false);
      return;
    }
    wishlistApi
      .checkProduct(product.id)
      .then(setIsWishlisted)
      .catch(() => {});
  }, [isAuthenticated, product.id]);

  const hasDiscount = product.comparePrice != null && product.comparePrice > product.price;
  const inStock = product.stockQuantity > 0;

  const handleAddToCart = () => {
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
        await navigator.share({ title: product.name, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
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

        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-bold">Rwf {product.price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">
              Rwf {product.comparePrice!.toLocaleString()}
            </span>
          )}
        </div>

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

      <p className="text-muted-foreground leading-relaxed">{product.description}</p>

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
                  selectedColor === color
                    ? 'border-accent-rose scale-110'
                    : 'border-gray-300 hover:border-accent-rose'
                }`}
                style={{ backgroundColor: colorHex(color) }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

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

      <div>
        <label className="text-sm font-semibold mb-3 block">Quantity</label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 bg-accent-rose hover:bg-accent-rose-dark"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
        >
          {isTogglingWishlist ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart
              className={`h-5 w-5 ${isWishlisted ? 'fill-accent-rose text-accent-rose' : ''}`}
            />
          )}
        </Button>
        <Button size="lg" variant="outline" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

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
  );
}
