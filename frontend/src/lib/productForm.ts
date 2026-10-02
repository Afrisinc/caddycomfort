import type { Category, Product } from '@/types/api';

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  comparePrice: string;
  sku: string;
  stockQuantity: string;
  categoryId: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export const MAX_PRODUCT_IMAGES = 5;
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export const EMPTY_PRODUCT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  price: '',
  salePrice: '',
  comparePrice: '',
  sku: '',
  stockQuantity: '0',
  categoryId: '',
  images: [],
  sizes: [],
  colors: [],
  tags: [],
  isActive: true,
  isFeatured: false,
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const numberText = (value: number | null | undefined) => (value ? String(value) : '');

export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: numberText(product.price),
    salePrice: numberText(product.salePrice),
    comparePrice: numberText(product.comparePrice),
    sku: product.sku,
    stockQuantity: String(product.stockQuantity ?? 0),
    categoryId: product.categoryId,
    images: product.images ?? [],
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    tags: product.tags ?? [],
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  };
}

const toAmount = (value: string) => (value.trim() === '' ? undefined : Number(value));

export function formValuesToPayload(values: ProductFormValues) {
  const salePrice = toAmount(values.salePrice);
  const comparePrice = toAmount(values.comparePrice);
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || slugify(values.name),
    description: values.description.trim(),
    price: Number(values.price),
    salePrice: salePrice && salePrice > 0 ? salePrice : undefined,
    comparePrice: comparePrice && comparePrice > 0 ? comparePrice : undefined,
    sku: values.sku.trim() || `PRD-${Date.now()}`,
    stockQuantity: Math.max(0, Math.floor(Number(values.stockQuantity) || 0)),
    categoryId: values.categoryId,
    images: values.images,
    sizes: values.sizes,
    colors: values.colors,
    tags: values.tags,
    isActive: values.isActive,
    isFeatured: values.isFeatured,
  };
}

export type ProductPayload = ReturnType<typeof formValuesToPayload>;

export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const price = Number(values.price);
  const sale = toAmount(values.salePrice);
  const compare = toAmount(values.comparePrice);
  const stock = Number(values.stockQuantity);

  if (!values.name.trim()) errors.name = 'Enter a product name';
  if (values.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = 'Use lowercase letters, numbers and hyphens only';
  }
  if (!values.description.trim()) errors.description = 'Add a short description';
  if (!values.categoryId) errors.categoryId = 'Choose a category';
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a price above 0';
  if (sale !== undefined && sale > 0) {
    if (!Number.isFinite(sale)) errors.salePrice = 'Enter a valid amount';
    else if (price > 0 && sale >= price)
      errors.salePrice = 'Sale price must be lower than the regular price';
  }
  if (compare !== undefined && compare > 0 && price > 0 && compare <= price) {
    errors.comparePrice = 'Compare-at price must be higher than the regular price';
  }
  if (!Number.isInteger(stock) || stock < 0)
    errors.stockQuantity = 'Enter a whole number, 0 or more';
  return errors;
}

export function categoryOptions(categories: Category[]): { value: string; label: string }[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  return categories
    .map((category) => {
      const parent = category.parentId ? byId.get(category.parentId) : undefined;
      return {
        value: category.id,
        label: parent ? `${parent.name} › ${category.name}` : category.name,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}
