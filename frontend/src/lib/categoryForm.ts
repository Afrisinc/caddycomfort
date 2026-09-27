import type { Category } from '@/types/api';
import { slugify } from '@/lib/productForm';

export const NO_PARENT = 'none';

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  images: string[];
}

export type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>;

export const EMPTY_CATEGORY_VALUES: CategoryFormValues = {
  name: '',
  slug: '',
  description: '',
  parentId: NO_PARENT,
  images: [],
};

export function categoryToFormValues(category: Category): CategoryFormValues {
  const image = category.image || category.imageUrl;
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    parentId: category.parentId ?? NO_PARENT,
    images: image ? [image] : [],
  };
}

export function categoryPayload(values: CategoryFormValues) {
  const isTopLevel = values.parentId === NO_PARENT;
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || slugify(values.name),
    description: values.description.trim() || null,
    parentId: isTopLevel ? null : values.parentId,
    image: isTopLevel ? (values.images[0] ?? null) : null,
  };
}

export type CategoryPayload = ReturnType<typeof categoryPayload>;

export function validateCategory(
  values: CategoryFormValues,
  categories: Category[],
  currentId?: string,
): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  const name = values.name.trim().toLowerCase();
  if (!name) errors.name = 'Enter a category name';
  else if (categories.some((c) => c.id !== currentId && c.name.toLowerCase() === name)) {
    errors.name = 'A category with this name already exists';
  }
  const slug = values.slug.trim() || slugify(values.name);
  if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = 'Use lowercase letters, numbers and hyphens only';
  } else if (categories.some((c) => c.id !== currentId && c.slug === slug)) {
    errors.slug = 'This URL handle is already used by another category';
  }
  return errors;
}

function descendantIds(categories: Category[], rootId: string): Set<string> {
  const result = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const category of categories) {
      if (category.parentId && result.has(category.parentId) && !result.has(category.id)) {
        result.add(category.id);
        added = true;
      }
    }
  }
  return result;
}

export function parentOptions(categories: Category[], currentId?: string) {
  const excluded = currentId ? descendantIds(categories, currentId) : new Set<string>();
  return categories
    .filter((c) => !c.parentId && !excluded.has(c.id))
    .map((c) => ({ value: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export interface CategoryRow {
  category: Category;
  depth: number;
  childCount: number;
}

export function categoryRows(categories: Category[], query = ''): CategoryRow[] {
  const term = query.trim().toLowerCase();
  const matches = (c: Category) =>
    !term ||
    c.name.toLowerCase().includes(term) ||
    c.slug.includes(term) ||
    (c.description ?? '').toLowerCase().includes(term);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);
  const byName = (a: Category, b: Category) => a.name.localeCompare(b.name);
  const rows: CategoryRow[] = [];

  const hasMatch = (category: Category): boolean =>
    matches(category) || childrenOf(category.id).some(hasMatch);

  const visit = (category: Category, depth: number, parentMatched: boolean) => {
    const selfMatched = parentMatched || matches(category);
    if (!selfMatched && !hasMatch(category)) return;
    const children = childrenOf(category.id).sort(byName);
    rows.push({ category, depth, childCount: children.length });
    children.forEach((child) => visit(child, depth + 1, selfMatched));
  };

  categories
    .filter((c) => !c.parentId || !categories.some((p) => p.id === c.parentId))
    .sort(byName)
    .forEach((root) => visit(root, 0, false));
  return rows;
}

export function groupRowsByRoot(rows: CategoryRow[]): CategoryRow[][] {
  const groups: CategoryRow[][] = [];
  for (const row of rows) {
    if (row.depth === 0 || groups.length === 0) groups.push([row]);
    else groups[groups.length - 1].push(row);
  }
  return groups;
}
