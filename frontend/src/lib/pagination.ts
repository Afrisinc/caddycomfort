export type PageItem = number | 'gap';

export function getPageItems(page: number, totalPages: number, siblings = 1): PageItem[] {
  if (totalPages <= 5 + siblings * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);
  const items: PageItem[] = [1];

  if (start > 2) items.push('gap');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push('gap');
  items.push(totalPages);

  return items;
}
