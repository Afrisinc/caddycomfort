import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Eye, Star, TrendingUp } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';

interface ProductCardProps {
  id: string;
  title: string;
  category: string;
  categorySlug?: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: string;
  imageAlt?: string;
  href?: string;
  rating?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isWishlisted?: boolean;
  onAddToCart?: () => void;
  onWishlist?: () => void;
  onQuickView?: () => void;
}

export function ProductCard({
  id,
  title,
  category,
  categorySlug,
  price,
  originalPrice,
  discount,
  image,
  imageAlt = title,
  href = '#',
  rating,
  isNew = false,
  isBestSeller = false,
  isWishlisted = false,
  onAddToCart,
  onWishlist,
  onQuickView,
}: ProductCardProps) {
  return (
    <div className="group relative">
      <Card className="overflow-hidden border border-border/50 hover:border-accent-rose/30 shadow-sm hover:shadow-luxury transition-all duration-300 bg-card">
        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {isNew && (
            <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">
              New
            </span>
          )}
          {isBestSeller && (
            <span className="bg-accent-rose text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Best
            </span>
          )}
        </div>

        {/* Product Header - Price and Discount */}
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start gap-2">
          <span className="text-base font-bold text-foreground bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm">
            {price}
            {originalPrice && (
              <span className="ml-2 text-xs text-muted-foreground line-through font-normal">
                {originalPrice}
              </span>
            )}
          </span>
          {discount && (
            <span className="bg-accent-rose text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md animate-pulse shrink-0">
              {discount} Off
            </span>
          )}
        </div>

        {/* Product Image */}
        <Link href={href}>
          <div className="relative h-[300px] md:h-[350px] overflow-visible bg-transparent p-4">
            <div className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
              {/* Hover overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

              {image ? (
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-rose-subtle to-accent-rose-muted flex items-center justify-center">
                  <span className="text-4xl opacity-50">📦</span>
                </div>
              )}

              {/* Quick view badge on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="bg-card/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border/50">
                  <span className="text-sm font-medium text-foreground">Quick View</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Product Actions - Visible on Hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-20">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-card/95 backdrop-blur-md hover:bg-accent-rose hover:text-white shadow-lg border border-border/50 hover:border-accent-rose hover:scale-110 transition-all duration-200"
            onClick={onAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-card/95 backdrop-blur-md hover:bg-accent-rose hover:text-white shadow-lg border border-border/50 hover:border-accent-rose hover:scale-110 transition-all duration-200"
            onClick={onQuickView}
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className={`rounded-full bg-card/95 backdrop-blur-md hover:bg-accent-rose hover:text-white shadow-lg border border-border/50 hover:border-accent-rose hover:scale-110 transition-all duration-200 ${isWishlisted ? 'text-accent-rose' : ''}`}
            onClick={onWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Product Details */}
        <div className="p-5 space-y-2.5 bg-gradient-to-b from-card to-card/95">
          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                  }`}
                />
              ))}
              {rating > 0 && (
                <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
              )}
            </div>
          )}

          <Link href={href}>
            <h4 className="text-base font-semibold hover:text-accent-rose transition-colors line-clamp-2 min-h-10 group-hover:underline decoration-accent-rose/50">
              {title}
            </h4>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <Link href={`/shop?category=${categorySlug || category.toLowerCase()}`}>
              <h5 className="text-xs font-medium text-muted-foreground hover:text-accent-rose transition-colors uppercase tracking-wide">
                {category}
              </h5>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
