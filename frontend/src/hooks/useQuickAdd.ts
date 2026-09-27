import { useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import { useCartStore } from '@/store/useCartStore';
import { getProductPricing } from '@/lib/pricing';
import { requiresOptions } from '@/lib/productCard';
import type { Product } from '@/types/api';

export function useQuickAdd() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  return useCallback(
    (product: Product) => {
      if (product.stockQuantity <= 0) {
        toast.error(`${product.name} is sold out`);
        return;
      }
      if (requiresOptions(product)) {
        router.push(`/shop/${product.id}`);
        return;
      }
      addItem({
        id: product.id,
        name: product.name,
        price: getProductPricing(product).current,
        image: product.imageUrl || product.images[0] || '',
        quantity: 1,
        size: product.sizes[0] || '',
        color: product.colors[0] || '',
      });
      toast.success(`${product.name} added to cart`, {
        action: { label: 'View cart', onClick: () => router.push('/cart') },
      });
    },
    [addItem, router],
  );
}
