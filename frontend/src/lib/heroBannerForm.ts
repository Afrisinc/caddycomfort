import type { Category, HeroBanner } from '@/types/api';
import type { HeroBannerPayload } from '@/lib/api/heroBanners';

export const CUSTOM_LINK = 'custom';

export const HERO_LIMITS = {
  eyebrow: 60,
  title: 120,
  ctaText: 40,
  imageAlt: 160,
} as const;

export interface HeroBannerFormValues {
  eyebrow: string;
  title: string;
  ctaText: string;
  linkChoice: string;
  customLink: string;
  imageAlt: string;
  images: string[];
  isActive: boolean;
}

export type HeroBannerFormErrors = Partial<Record<keyof HeroBannerFormValues, string>>;

export const EMPTY_HERO_VALUES: HeroBannerFormValues = {
  eyebrow: '',
  title: '',
  ctaText: 'Shop now',
  linkChoice: '/shop',
  customLink: '',
  imageAlt: '',
  images: [],
  isActive: true,
};

export interface LinkOption {
  value: string;
  label: string;
}

export function linkOptions(categories: Category[]): LinkOption[] {
  return [
    { value: '/shop', label: 'All products' },
    ...categories.map((category) => ({
      value: `/shop?category=${category.slug}`,
      label: category.parent ? `${category.parent.name} › ${category.name}` : category.name,
    })),
  ];
}

export function heroBannerToFormValues(
  banner: HeroBanner,
  options: LinkOption[],
): HeroBannerFormValues {
  const known = options.some((option) => option.value === banner.ctaLink);
  return {
    eyebrow: banner.eyebrow,
    title: banner.title,
    ctaText: banner.ctaText,
    linkChoice: known ? banner.ctaLink : CUSTOM_LINK,
    customLink: known ? '' : banner.ctaLink,
    imageAlt: banner.imageAlt,
    images: banner.image ? [banner.image] : [],
    isActive: banner.isActive,
  };
}

export function resolvedLink(values: HeroBannerFormValues): string {
  return values.linkChoice === CUSTOM_LINK ? values.customLink.trim() : values.linkChoice;
}

export function validateHeroBanner(values: HeroBannerFormValues): HeroBannerFormErrors {
  const errors: HeroBannerFormErrors = {};
  if (values.images.length === 0) errors.images = 'Add a banner image';
  if (!values.eyebrow.trim()) errors.eyebrow = 'Enter a short label';
  if (!values.title.trim()) errors.title = 'Enter a headline';
  if (!values.ctaText.trim()) errors.ctaText = 'Enter the button text';
  if (values.linkChoice === CUSTOM_LINK) {
    const link = values.customLink.trim();
    if (!link) errors.customLink = 'Enter a link';
    else if (!/^(\/(?!\/)|https?:\/\/)/i.test(link)) {
      errors.customLink = 'Start with / or https:// (for example /shop)';
    }
  }
  return errors;
}

export function heroBannerPayload(values: HeroBannerFormValues): HeroBannerPayload {
  const title = values.title.trim();
  return {
    eyebrow: values.eyebrow.trim(),
    title,
    ctaText: values.ctaText.trim(),
    ctaLink: resolvedLink(values),
    image: values.images[0],
    imageAlt: values.imageAlt.trim() || title,
    isActive: values.isActive,
  };
}
