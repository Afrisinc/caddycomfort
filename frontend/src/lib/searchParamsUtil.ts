export function buildSearchUrl(
  pathname: string,
  current: URLSearchParams,
  updates: Record<string, string | string[] | null>
): string {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    next.delete(key);
    if (value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => next.append(key, v));
    } else {
      next.set(key, value);
    }
  }

  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
