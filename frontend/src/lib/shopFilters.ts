export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Brown', 'Beige'];

export const MAX_PRICE = 1000000;
export const PAGE_SIZE = 12;

export const SORT_LABELS: Record<string, string> = {
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
};

export const SORT_OPTIONS: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
  featured: { sortBy: 'isFeatured', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
};
