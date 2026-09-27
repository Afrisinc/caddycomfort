const STORAGE_KEY = 'recentSearches';
const MAX_ITEMS = 5;

export function loadRecentSearches(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === 'string').slice(0, MAX_ITEMS)
      : [];
  } catch {
    return [];
  }
}

function persist(items: string[]): string[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    return items;
  }
  return items;
}

export function addRecentSearch(items: string[], term: string): string[] {
  const clean = term.trim();
  if (clean.length < 2) return items;
  const lower = clean.toLowerCase();
  return persist([clean, ...items.filter((s) => s.toLowerCase() !== lower)].slice(0, MAX_ITEMS));
}

export function removeRecentSearch(items: string[], term: string): string[] {
  return persist(items.filter((s) => s !== term));
}

export function clearRecentSearches(): string[] {
  return persist([]);
}
