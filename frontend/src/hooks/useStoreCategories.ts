import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/types/api';

const NO_CATEGORIES: Category[] = [];

let pending: Promise<Category[]> | null = null;

const loadStoreCategories = () => {
  pending ??= categoriesApi
    .getAll()
    .then((all) =>
      all
        .filter(
          (c) => !c.parentId && ((c._count?.products ?? 0) > 0 || (c.children?.length ?? 0) > 0),
        )
        .sort((a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0)),
    )
    .catch((error) => {
      pending = null;
      throw error;
    });
  return pending;
};

export function useStoreCategories() {
  return useAsyncData(loadStoreCategories, NO_CATEGORIES);
}

export const categoryHref = (category: Category) => `/shop?category=${category.slug}`;

export const categoryCover = (category: Category): string | undefined =>
  category.image ||
  category.imageUrl ||
  category.parent?.image ||
  category.parent?.imageUrl ||
  undefined;
