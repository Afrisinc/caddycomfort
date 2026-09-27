import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowRight, Clock, Loader2, Package, Search, SearchX, X } from 'lucide-react';
import { useRouter } from '@/router/compat';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { HighlightMatch } from '@/components/common/HighlightMatch';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { MIN_QUERY_LENGTH, useProductSearch } from '@/hooks/useProductSearch';
import {
  addRecentSearch,
  clearRecentSearches,
  loadRecentSearches,
  removeRecentSearch,
} from '@/lib/recentSearches';
import { formatRwf, getProductPricing } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/api';

interface SearchDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

type SearchOption =
  | { kind: 'recent'; key: string; term: string }
  | { kind: 'product'; key: string; product: Product }
  | { kind: 'all'; key: string };

const QUICK_LINKS = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Women', href: '/shop?category=womans-cloth' },
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Kids', href: '/shop?category=kids' },
];

const optionClass =
  'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors';

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>(loadRecentSearches);
  const { results, status, retry, isPending } = useProductSearch(query);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= MIN_QUERY_LENGTH;

  const options = useMemo<SearchOption[]>(() => {
    if (!hasQuery) return recent.map((term) => ({ kind: 'recent', key: `recent-${term}`, term }));
    const items: SearchOption[] = results.map((product) => ({
      kind: 'product',
      key: product.id,
      product,
    }));
    if (results.length > 0) items.push({ kind: 'all', key: 'all' });
    return items;
  }, [hasQuery, recent, results]);

  useEffect(() => setActiveIndex(-1), [trimmed, results]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const close = () => {
    onOpenChange(false);
    setQuery('');
  };

  const searchAll = (term = trimmed) => {
    if (term.length < MIN_QUERY_LENGTH) return;
    setRecent((items) => addRecentSearch(items, term));
    router.push(`/search?q=${encodeURIComponent(term)}`);
    close();
  };

  const openProduct = (product: Product) => {
    setRecent((items) => addRecentSearch(items, trimmed));
    router.push(`/shop/${product.id}`);
    close();
  };

  const select = (option: SearchOption) => {
    if (option.kind === 'recent') searchAll(option.term);
    else if (option.kind === 'product') openProduct(option.product);
    else searchAll();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && options.length) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp' && options.length) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = options[activeIndex];
      if (option) select(option);
      else searchAll();
    }
  };

  const optionProps = (option: SearchOption, index: number) => ({
    id: `${listId}-${index}`,
    role: 'option' as const,
    'aria-selected': index === activeIndex,
    'data-index': index,
    tabIndex: -1,
    onMouseMove: () => setActiveIndex(index),
    onClick: () => select(option),
  });

  const activeClass = (index: number) =>
    index === activeIndex ? 'bg-muted text-foreground' : 'text-foreground/90';

  const renderBody = () => {
    if (!hasQuery) {
      return (
        <div className="space-y-6 p-3 sm:p-4">
          {recent.length > 0 && (
            <section>
              <div className="mb-1.5 flex items-center justify-between px-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent searches
                </p>
                <button
                  type="button"
                  onClick={() => setRecent(clearRecentSearches())}
                  className="rounded text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                >
                  Clear
                </button>
              </div>
              <div role="listbox" id={listId} aria-label="Recent searches">
                {options.map((option, index) =>
                  option.kind === 'recent' ? (
                    <div
                      key={option.key}
                      {...optionProps(option, index)}
                      className={cn(optionClass, 'group h-11', activeClass(index))}
                    >
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{option.term}</span>
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={`Remove ${option.term} from recent searches`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecent((items) => removeRecentSearch(items, option.term));
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100 pointer-coarse:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null,
                )}
              </div>
            </section>
          )}

          <section className="px-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Browse
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-4 text-sm font-medium transition-colors outline-none hover:border-foreground/30 hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (status === 'error' && results.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="Search is taking longer than usual"
          description="Please check your connection and try again."
          action={
            <Button variant="outline" onClick={retry}>
              Try again
            </Button>
          }
          className="m-4 border-0 bg-transparent py-12"
        />
      );
    }

    if (results.length === 0 && isPending) {
      return (
        <div className="space-y-1 p-3 sm:p-4" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title={`No results for “${trimmed}”`}
          description="Check the spelling or try a more general word like “dress” or “heels”."
          action={
            <Button variant="outline" asChild>
              <Link href="/shop" onClick={close}>
                Browse all products
              </Link>
            </Button>
          }
          className="m-4 border-0 bg-transparent py-12"
        />
      );
    }

    return (
      <div
        role="listbox"
        id={listId}
        aria-label="Search results"
        className={cn('p-3 transition-opacity sm:p-4', isPending && 'opacity-60')}
      >
        <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Products
        </p>
        {options.map((option, index) => {
          if (option.kind === 'product') {
            const { product } = option;
            const { current, original } = getProductPricing(product);
            const image = product.imageUrl || product.images[0];
            return (
              <div
                key={option.key}
                {...optionProps(option, index)}
                className={cn(optionClass, 'py-2', activeClass(index))}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      fallback={
                        <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                      }
                    />
                  ) : (
                    <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    <HighlightMatch text={product.name} query={trimmed} />
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {product.category?.name || 'Uncategorized'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums">{formatRwf(current)}</p>
                  {original && (
                    <p className="text-xs tabular-nums text-muted-foreground line-through">
                      {formatRwf(original)}
                    </p>
                  )}
                </div>
              </div>
            );
          }
          if (option.kind === 'all') {
            return (
              <div
                key={option.key}
                {...optionProps(option, index)}
                className={cn(
                  optionClass,
                  'mt-2 h-11 border-t pt-2 font-medium text-accent-rose',
                  activeClass(index),
                  index === activeIndex && 'text-accent-rose',
                )}
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">See all results for “{trimmed}”</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => setRecent(loadRecentSearches())}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 fixed inset-0 z-50 flex flex-col overflow-hidden bg-background shadow-2xl outline-none duration-200 sm:inset-x-4 sm:top-[12vh] sm:bottom-auto sm:mx-auto sm:max-h-[72vh] sm:max-w-2xl sm:rounded-2xl sm:border"
        >
          <DialogPrimitive.Title className="sr-only">Search products</DialogPrimitive.Title>

          <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-5">
            {isPending && hasQuery ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search dresses, shoes, wigs…"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={options.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <DialogPrimitive.Close className="hidden h-7 shrink-0 items-center rounded-md border bg-muted/50 px-2 text-[11px] font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40 sm:inline-flex">
              Esc
            </DialogPrimitive.Close>
            <DialogPrimitive.Close className="-mr-1 flex h-9 shrink-0 items-center px-2 text-sm font-medium text-accent-rose sm:hidden">
              Cancel
            </DialogPrimitive.Close>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
            {renderBody()}
          </div>

          <div className="hidden shrink-0 items-center gap-4 border-t bg-muted/30 px-5 py-2.5 text-[11px] text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-sans">↑</kbd>
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-sans">↓</kbd>
              to navigate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-sans">↵</kbd>
              to select
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-sans">esc</kbd>
              to close
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
