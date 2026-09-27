export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export interface PageQuery {
  page: number;
  limit: number;
}

export interface PageMeta extends PageQuery {
  total: number;
  totalPages: number;
}

function positiveInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePageQuery(
  query: Record<string, unknown>,
  defaultLimit = DEFAULT_PAGE_SIZE,
): PageQuery {
  return {
    page: positiveInt(query.page, 1),
    limit: Math.min(positiveInt(query.limit, defaultLimit), MAX_PAGE_SIZE),
  };
}

export function pageMeta(total: number, { page, limit }: PageQuery): PageMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export function skipOf({ page, limit }: PageQuery): number {
  return (page - 1) * limit;
}

export function paginate<T>(items: T[], query: PageQuery) {
  const start = skipOf(query);
  return {
    items: items.slice(start, start + query.limit),
    pagination: pageMeta(items.length, query),
  };
}
