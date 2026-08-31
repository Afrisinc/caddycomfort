import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/router/compat';
import Image from '@/components/common/Image';
import { Search, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/useDebounce';
import { productsApi } from '@/lib/api';
import { Product } from '@/types/api';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recentSearches');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    try {
      setIsSearching(true);
      const results = await productsApi.search(searchQuery, 6);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, fetchSuggestions]);

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      saveRecentSearch(finalQuery);
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
      onOpenChange(false);
      setQuery('');
    }
  };

  const goToProduct = (product: Product) => {
    saveRecentSearch(query);
    router.push(`/shop/${product.id}`);
    onOpenChange(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          goToProduct(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  const clearRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setTimeout(() => {
        setQuery('');
        setSelectedIndex(-1);
        setSuggestions([]);
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Search Products</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 h-12 text-base"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Recent Searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3 px-2">Recent Searches</h4>
                <div className="space-y-1">
                  {recentSearches.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer group"
                      onClick={() => handleSearch(term)}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{term}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => clearRecent(term, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {query.length >= 2 && (
              <div>
                {isSearching ? (
                  <div className="space-y-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                        <div className="w-16 h-16 shrink-0 rounded bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-muted" />
                          <div className="h-3 w-1/3 rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <h4 className="text-sm font-semibold mb-3 px-2">Products</h4>
                    <div className="space-y-1">
                      {suggestions.map((product, index) => (
                        <div
                          key={product.id}
                          className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                            index === selectedIndex ? 'bg-accent-rose/10' : 'hover:bg-muted'
                          }`}
                          onClick={() => goToProduct(product)}
                        >
                          <div className="relative w-16 h-16 shrink-0 bg-muted rounded overflow-hidden">
                            {(product.imageUrl || product.images[0]) && (
                              <Image
                                src={product.imageUrl || product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {product.category?.name || 'Uncategorized'}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-accent-rose">
                            Rwf {product.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No products found</p>
                    <Button
                      variant="default"
                      className="bg-accent-rose hover:bg-accent-rose-dark"
                      onClick={() => handleSearch()}
                    >
                      Search for &quot;{query}&quot;
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {query.length < 2 && recentSearches.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Start typing to search for products</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
