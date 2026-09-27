import { Package, Trash2 } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { formatRwf } from '@/lib/pricing';
import type { CartItem } from '@/store/useCartStore';

interface CartLineItemProps {
  readonly item: CartItem;
  readonly onQuantityChange: (quantity: number) => void;
  readonly onRemove: () => void;
}

export function CartLineItem({ item, onQuantityChange, onRemove }: CartLineItemProps) {
  const href = `/shop/${item.id}`;
  const variants = [item.size && `Size ${item.size}`, item.color && item.color].filter(Boolean);

  return (
    <li className="flex gap-4 py-6 first:pt-0 sm:gap-6">
      <Link
        href={href}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40 sm:h-32 sm:w-28"
        tabIndex={-1}
        aria-hidden="true"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
            fallback={<Package className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />}
          />
        ) : (
          <Package className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={href}
              className="line-clamp-2 font-medium text-foreground transition-colors outline-none hover:text-accent-rose focus-visible:text-accent-rose focus-visible:underline"
            >
              {item.name}
            </Link>
            {variants.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{variants.join(' · ')}</p>
            )}
            <p className="mt-1 text-sm tabular-nums text-muted-foreground">
              {formatRwf(item.price)}
              {item.quantity > 1 && <span> each</span>}
            </p>
          </div>
          <p className="shrink-0 text-right font-semibold tabular-nums">
            {formatRwf(item.price * item.quantity)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <QuantityStepper
            value={item.quantity}
            onChange={onQuantityChange}
            size="sm"
            label={`Quantity of ${item.name}`}
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from cart`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </li>
  );
}
