'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';
import { toProductCardProps } from '@/lib/productCard';
import { wishlistApi } from '@/lib/api';
import { Product } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

export function ShopProductGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
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

  const handleQuickAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      toast.error('This item is out of stock');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.imageUrl || product.images[0] || '',
      quantity: 1,
      size: product.sizes[0] || '',
      color: product.colors[0] || '',
    });
    toast.success(`${product.name} added to cart`);
  };

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
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">No products match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...toProductCardProps(product)}
          href={`/shop/${product.id}`}
          isWishlisted={wishlistIds.has(product.id)}
          onAddToCart={() => handleQuickAddToCart(product)}
          onWishlist={() => handleToggleWishlist(product)}
          onQuickView={() => router.push(`/shop/${product.id}`)}
        />
      ))}
    </div>
  );
}
