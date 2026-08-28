'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/products/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { productsApi, categoriesApi, wishlistApi } from '@/lib/api';
import { toProductCardProps } from '@/lib/productCard';
import { Product } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Pink', hex: '#EC4899' },
];
const MAX_PRICE = 1000000;
const PAGE_SIZE = 12;

const SORT_OPTIONS: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
  featured: { sortBy: 'isFeatured', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
};

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const categorySlug = searchParams.get('category');

  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [priceDraft, setPriceDraft] = useState([0, MAX_PRICE]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categoryResolved, setCategoryResolved] = useState(!categorySlug);

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  // Resolve the ?category= slug (from a product card / nav link) to a real categoryId.
  useEffect(() => {
    if (!categorySlug) {
      setCategoryId(undefined);
      setCategoryName(null);
      setCategoryResolved(true);
      return;
    }
    setCategoryResolved(false);
    categoriesApi
      .getBySlug(categorySlug)
      .then((category) => {
        setCategoryId(category.id);
        setCategoryName(category.name);
      })
      .catch(() => {
        setCategoryId(undefined);
        setCategoryName(null);
      })
      .finally(() => setCategoryResolved(true));
  }, [categorySlug]);

  const fetchProducts = useCallback(async () => {
    if (!categoryResolved) return;
    try {
      setIsLoading(true);
      const sort = SORT_OPTIONS[sortBy];
      const result = await productsApi.getAll(
        {
          categoryId,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < MAX_PRICE ? priceRange[1] : undefined,
          sizes: selectedSizes.length ? selectedSizes : undefined,
          colors: selectedColors.length ? selectedColors : undefined,
          isActive: true,
        },
        { page: currentPage, limit: PAGE_SIZE },
        sort
      );
      setProducts(result.products);
      setPagination({ total: result.pagination.total, totalPages: result.pagination.totalPages || 1 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [categoryResolved, categoryId, priceRange, selectedSizes, selectedColors, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 whenever a filter (not the page itself) changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, priceRange, selectedSizes, selectedColors, sortBy]);

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

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
  };

  const clearFilters = () => {
    setPriceRange([0, MAX_PRICE]);
    setPriceDraft([0, MAX_PRICE]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const clearCategory = () => {
    router.push('/shop');
  };

  const activeFiltersCount =
    selectedSizes.length + selectedColors.length + (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0);

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

  const filterSectionContent = (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceDraft}
            onValueChange={setPriceDraft}
            onValueCommit={setPriceRange}
            max={MAX_PRICE}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rwf {priceDraft[0].toLocaleString()}</span>
            <span>Rwf {priceDraft[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSize(size)}
              className={selectedSizes.includes(size) ? 'bg-accent-rose hover:bg-accent-rose-dark' : ''}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Color</h3>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? 'border-accent-rose scale-110'
                  : 'border-gray-300 hover:border-accent-rose'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-serif text-center mb-4">
              {categoryName || 'Shop Collection'}
            </h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Discover our curated selection of timeless pieces
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-sm text-accent-rose font-medium">{activeFiltersCount} active</span>
                  )}
                </div>
                {filterSectionContent}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <span className="ml-2 bg-accent-rose text-white text-xs px-2 py-0.5 rounded-full">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader className="border-b">
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto px-4">{filterSectionContent}</div>
                      <SheetFooter className="border-t pt-4">
                        <SheetClose asChild>
                          <Button className="w-full bg-accent-rose hover:bg-accent-rose-dark">
                            Show {pagination.total} Result{pagination.total === 1 ? '' : 's'}
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{pagination.total}</span> products found
                  </p>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Featured" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Tags */}
              {(activeFiltersCount > 0 || categoryName) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {categoryName && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm">
                      {categoryName}
                      <button onClick={clearCategory}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm">
                      Rwf {priceRange[0].toLocaleString()} - Rwf {priceRange[1].toLocaleString()}
                      <button
                        onClick={() => {
                          setPriceRange([0, MAX_PRICE]);
                          setPriceDraft([0, MAX_PRICE]);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null}
                  {selectedSizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm"
                    >
                      Size: {size}
                      <button onClick={() => toggleSize(size)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedColors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-accent-rose-subtle text-accent-rose rounded-full text-sm"
                    >
                      {color}
                      <button onClick={() => toggleColor(color)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Products Grid */}
              {isLoading ? (
                <ProductGridSkeleton count={PAGE_SIZE} />
              ) : products.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-muted-foreground">No products match your filters.</p>
                </div>
              ) : (
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
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'bg-accent-rose hover:bg-accent-rose-dark' : ''}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}
