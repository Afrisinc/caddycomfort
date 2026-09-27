import { useCallback, useEffect, useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductGridSkeleton } from '@/components/products/ProductCardSkeleton';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { useWishlistStore } from '@/store/useWishlistStore';
import { wishlistApi } from '@/lib/api';
import { toProductCardProps } from '@/lib/productCard';
import { WishlistItem } from '@/types/api';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const quickAdd = useQuickAdd();
  const setSaved = useWishlistStore((state) => state.setSaved);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      setItems(await wishlistApi.getAll());
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, router, fetchWishlist]);

  const handleRemove = async (item: WishlistItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await wishlistApi.remove(item.id);
      setSaved(item.productId, false);
      toast(`${item.product.name} removed from wishlist`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await wishlistApi.add(item.productId);
              setSaved(item.productId, true);
              fetchWishlist();
            } catch {
              toast.error('Could not restore the item');
            }
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
      fetchWishlist();
    }
  };

  if (!isAuthenticated) return null;

  const count = items.length;
  const renderContent = () => {
    if (isLoading) return <ProductGridSkeleton count={4} columns={4} />;

    if (loadFailed) {
      return (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load your wishlist"
          description="Please check your connection and try again."
          action={
            <Button variant="outline" onClick={fetchWishlist}>
              Try again
            </Button>
          }
        />
      );
    }

    if (count === 0) {
      return (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={
            <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
              <Link href="/shop">Discover products</Link>
            </Button>
          }
        />
      );
    }

    return (
      <ProductGrid columns={4}>
        {items.map((item) => (
          <ProductCard
            key={item.id}
            {...toProductCardProps(item.product)}
            href={`/shop/${item.product.id}`}
            isWishlisted
            onWishlist={() => handleRemove(item)}
            onAddToCart={() => quickAdd(item.product)}
          />
        ))}
      </ProductGrid>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <PageHeader
          title="Wishlist"
          description={
            isLoading || loadFailed
              ? 'Your saved pieces'
              : `${count} ${count === 1 ? 'item' : 'items'} saved for later`
          }
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Account', href: '/account' },
            { label: 'Wishlist' },
          ]}
          actions={
            count > 0 && (
              <Button asChild variant="outline">
                <Link href="/shop">Continue shopping</Link>
              </Button>
            )
          }
        />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:pb-24">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </>
  );
}
