import { Package } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { formatRwf, getProductPricing } from '@/lib/pricing';
import type { Product } from '@/types/api';

interface ProductListItemProps {
  readonly product: Product;
  readonly rank?: number;
}

export function ProductListItem({ product, rank }: ProductListItemProps) {
  const { current, original } = getProductPricing(product);
  const image = product.imageUrl || product.images[0];
  const placeholder = <Package className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex items-center gap-4 rounded-xl p-3 transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-accent-rose/40"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallback={placeholder}
          />
        ) : (
          placeholder
        )}
        {rank !== undefined && (
          <span className="absolute top-1.5 left-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-background/95 px-1.5 text-xs font-semibold tabular-nums shadow-sm">
            {rank}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {product.category && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </p>
        )}
        <p className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-accent-rose">
          {product.name}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold tabular-nums">{formatRwf(current)}</span>
          {original && (
            <span className="text-xs tabular-nums text-muted-foreground line-through">
              {formatRwf(original)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
