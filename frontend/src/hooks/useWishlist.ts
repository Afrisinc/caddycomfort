import { useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { Product } from '@/types/api';

export function useWishlist() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ids = useWishlistStore((state) => state.ids);
  const pending = useWishlistStore((state) => state.pending);
  const storeToggle = useWishlistStore((state) => state.toggle);

  const toggle = useCallback(
    async (product: Pick<Product, 'id' | 'name'>) => {
      if (!isAuthenticated) {
        toast.error('Please log in to save items to your wishlist');
        router.push('/login');
        return;
      }
      try {
        const saved = await storeToggle(product.id);
        toast.success(
          saved ? `${product.name} saved to wishlist` : `${product.name} removed from wishlist`,
          {
            action: saved
              ? { label: 'View', onClick: () => router.push('/account/wishlist') }
              : undefined,
          },
        );
      } catch (error: any) {
        toast.error(error.message || 'Failed to update wishlist');
      }
    },
    [isAuthenticated, router, storeToggle],
  );

  return {
    count: ids.size,
    isSaved: (productId: string) => ids.has(productId),
    isPending: (productId: string) => pending.has(productId),
    toggle,
  };
}
