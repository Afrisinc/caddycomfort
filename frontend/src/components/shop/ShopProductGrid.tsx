import { useEffect, useState } from 'react';
import { useRouter } from '@/router/compat';
import { SearchX } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGrid } from '@/components/products/ProductGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { toProductCardProps } from '@/lib/productCard';
import { wishlistApi } from '@/lib/api';
import { Product } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { toast } from 'sonner';

interface ShopProductGridProps {
  readonly products: Product[];
  readonly hasFilters?: boolean;
  readonly onClearFilters?: () => void;
}

export function ShopProductGrid({ products, hasFilters, onClearFilters }: ShopProductGridProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const quickAdd = useQuickAdd();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    wishlistApi
      .getAll()
      .then((items) => setWishlistIds(new Set(items.map((i) => i.productId))))
      .catch(() => {});
  }, [isAuthenticated]);

  const handleToggleWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist');
      router.push('/login');
      return;
    }
    const inWishlist = wishlistIds.has(product.id);
    try {
      if (inWishlist) {
        await wishlistApi.removeByProductId(product.id);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.add(product.id);
        setWishlistIds((prev) => new Set(prev).add(product.id));
        toast.success('Saved to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  if (products.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No products match your filters"
        description="Try removing a filter or widening the price range to see more styles."
        action={
          hasFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear all filters
            </Button>
          )
        }
      />
    );
  }

  return (
    <ProductGrid>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...toProductCardProps(product)}
          href={`/shop/${product.id}`}
          isWishlisted={wishlistIds.has(product.id)}
          onAddToCart={() => quickAdd(product)}
          onWishlist={() => handleToggleWishlist(product)}
        />
      ))}
    </ProductGrid>
  );
}
