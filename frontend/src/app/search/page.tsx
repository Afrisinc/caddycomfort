'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/products/ProductCardSkeleton';
import { productsApi, categoriesApi, wishlistApi } from '@/lib/api';
import { toProductCardProps } from '@/lib/productCard';
import { Category, Product } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

const MAX_PRICE = 1000000;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((cats) => setCategories(cats.filter((c) => (c._count?.products ?? 0) > 0)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    wishlistApi.getAll().then((items) => setWishlistIds(new Set(items.map((i) => i.productId)))).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    productsApi
      .getAll({ search: query, isActive: true }, { limit: 40 })
      .then((r) => setProducts(r.products))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [query]);

  // Apply filters and sorting client-side over the search-matched batch
  const filteredProducts = React.useMemo(() => {
    let filtered = products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter((p) => p.categoryId && selectedCategoryIds.includes(p.categoryId));
    }

    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // relevance — keep the order the search API returned
        break;
    }

    return filtered;
  }, [products, priceRange, selectedCategoryIds, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, MAX_PRICE]);
    setSelectedCategoryIds([]);
    setSortBy('relevance');
  };

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

  const FilterSection = (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={MAX_PRICE}
          step={10000}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Rwf {priceRange[0].toLocaleString()}</span>
          <span>Rwf {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategoryIds.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <Label htmlFor={category.id} className="text-sm cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Header */}
      <div className="bg-muted/30 py-12 mb-8 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-3xl font-serif">
              Search Results for &quot;{query}&quot;
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isLoading ? 'Searching...' : `${filteredProducts.length} products found`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">{FilterSection}</div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">{FilterSection}</div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
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
            ) : (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
