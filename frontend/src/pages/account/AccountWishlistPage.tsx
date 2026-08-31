import { useState, useEffect } from 'react';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/products/ProductCardSkeleton';
import Link from '@/components/common/Link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { wishlistApi } from '@/lib/api';
import { toProductCardProps } from '@/lib/productCard';
import { WishlistItem } from '@/types/api';
import { toast } from 'sonner';
import { ArrowLeft, Heart } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const data = await wishlistApi.getAll();
      setItems(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (item: WishlistItem) => {
    // Optimistic: the heart click is the only affordance for "remove" on this page.
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await wishlistApi.remove(item.id);
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
      fetchWishlist();
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    const { product } = item;
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

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Account
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif mb-2">My Wishlist</h1>
              <p className="text-muted-foreground">
                {isLoading
                  ? 'Loading…'
                  : `${items.length} item${items.length === 1 ? '' : 's'} saved`}
              </p>
            </div>
            <Heart className="h-12 w-12 text-accent-rose" />
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  {...toProductCardProps(item.product)}
                  href={`/shop/${item.product.id}`}
                  isWishlisted
                  onWishlist={() => handleRemove(item)}
                  onAddToCart={() => handleAddToCart(item)}
                  onQuickView={() => router.push(`/shop/${item.product.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-serif mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Start adding items you love!</p>
              <Link href="/shop">
                <Button className="bg-accent-rose hover:bg-accent-rose-dark">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
