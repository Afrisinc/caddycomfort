import { SearchX } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGrid } from '@/components/products/ProductGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { toProductCardProps } from '@/lib/productCard';
import { Product } from '@/types/api';
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { useWishlist } from '@/hooks/useWishlist';

interface ShopProductGridProps {
  readonly products: Product[];
  readonly hasFilters?: boolean;
  readonly onClearFilters?: () => void;
}

export function ShopProductGrid({ products, hasFilters, onClearFilters }: ShopProductGridProps) {
  const quickAdd = useQuickAdd();
  const wishlist = useWishlist();

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
          isWishlisted={wishlist.isSaved(product.id)}
          onAddToCart={() => quickAdd(product)}
          onWishlist={() => wishlist.toggle(product)}
        />
      ))}
    </ProductGrid>
  );
}
