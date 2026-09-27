import { Heart, Package, ShoppingBag } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { RatingStars } from '@/components/products/RatingStars';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly categorySlug?: string;
  readonly price: string;
  readonly originalPrice?: string;
  readonly discount?: string;
  readonly image: string;
  readonly imageAlt?: string;
  readonly href?: string;
  readonly rating?: number;
  readonly isNew?: boolean;
  readonly isBestSeller?: boolean;
  readonly isWishlisted?: boolean;
  readonly soldOut?: boolean;
  readonly requiresOptions?: boolean;
  readonly onAddToCart?: () => void;
  readonly onWishlist?: () => void;
}

const floatingButton =
  'flex items-center justify-center rounded-full bg-background/95 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent-rose/50';

export function ProductCard({
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
  soldOut = false,
  requiresOptions = false,
  onAddToCart,
  onWishlist,
}: ProductCardProps) {
  const placeholder = (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/50">
      <Package className="h-10 w-10" />
    </div>
  );

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-muted">
        <Link
          href={href}
          className="absolute inset-0 outline-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              fill
              className={cn(
                'object-cover transition-transform duration-700 ease-out group-hover:scale-105',
                soldOut && 'grayscale-[40%]',
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              fallback={placeholder}
            />
          ) : (
            placeholder
          )}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {discount && (
            <span className="rounded-full bg-accent-rose px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              -{discount}
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              New
            </span>
          )}
          {isBestSeller && (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {onWishlist && (
          <button
            type="button"
            onClick={onWishlist}
            aria-label={
              isWishlisted ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`
            }
            aria-pressed={isWishlisted}
            className={cn(floatingButton, 'absolute top-3 right-3 h-9 w-9')}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isWishlisted ? 'fill-accent-rose text-accent-rose' : 'text-foreground/70',
              )}
            />
          </button>
        )}

        {soldOut && (
          <div className="pointer-events-none absolute inset-0 flex items-end bg-background/40 p-3">
            <span className="w-full rounded-lg bg-background/95 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-sm">
              Sold out
            </span>
          </div>
        )}

        {onAddToCart && !soldOut && (
          <>
            <button
              type="button"
              onClick={onAddToCart}
              className="absolute inset-x-3 bottom-3 hidden h-10 translate-y-2 items-center justify-center gap-2 rounded-lg bg-background/95 text-sm font-medium text-foreground opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 outline-none group-hover:translate-y-0 group-hover:opacity-100 hover:bg-foreground hover:text-background focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-rose/50 pointer-fine:flex"
            >
              <ShoppingBag className="h-4 w-4" />
              {requiresOptions ? 'Choose options' : 'Add to cart'}
            </button>
            <button
              type="button"
              onClick={onAddToCart}
              aria-label={requiresOptions ? `Choose options for ${title}` : `Add ${title} to cart`}
              className={cn(
                floatingButton,
                'absolute right-3 bottom-3 h-9 w-9 pointer-fine:hidden',
              )}
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3.5">
        <Link
          href={`/shop?category=${categorySlug || category.toLowerCase()}`}
          className="w-fit text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent-rose"
        >
          {category}
        </Link>
        <Link
          href={href}
          className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors outline-none hover:text-accent-rose focus-visible:text-accent-rose focus-visible:underline sm:text-[15px]"
        >
          {title}
        </Link>
        {rating !== undefined && rating > 0 && <RatingStars rating={rating} className="mt-0.5" />}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1.5">
          <span className="text-sm font-semibold tabular-nums text-foreground sm:text-base">
            {price}
          </span>
          {originalPrice && (
            <span className="text-xs tabular-nums text-muted-foreground line-through sm:text-sm">
              <span className="sr-only">Was </span>
              {originalPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
