import { Package } from 'lucide-react';
import Image from '@/components/common/Image';
import { formatRwf } from '@/lib/pricing';
import { formatVariant } from '@/lib/checkout';
import type { CartItem } from '@/store/useCartStore';

interface OrderItemsListProps {
  readonly items: CartItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const variant = formatVariant(item);
        return (
          <li key={`${item.id}-${item.size}-${item.color}`} className="flex items-center gap-3">
            <div className="relative h-16 w-14 shrink-0">
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                    fallback={
                      <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                    }
                  />
                ) : (
                  <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-semibold tabular-nums text-background">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              {variant && <p className="truncate text-xs text-muted-foreground">{variant}</p>}
            </div>
            <p className="shrink-0 text-sm font-medium tabular-nums">
              {formatRwf(item.price * item.quantity)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
