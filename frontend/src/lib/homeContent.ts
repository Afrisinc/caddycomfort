export interface HeroSlide {
  eyebrow: string;
  title: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imageAlt: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: 'New arrival',
    title: 'Step into style with our premium shoes collection',
    ctaText: 'Shop shoes',
    ctaLink: '/shop?category=shoes',
    image: '/new-images/hero-1.jpg',
    imageAlt: 'Premium shoes from the CaddyComfort collection',
  },
  {
    eyebrow: 'Perfect for summer evenings',
    title: 'Elegant dresses for every beautiful moment',
    ctaText: 'Shop dresses',
    ctaLink: '/shop?category=dresses',
    image: '/new-images/hero-4.jpg',
    imageAlt: 'Elegant evening dress in the CaddyComfort boutique',
  },
  {
    eyebrow: 'Limited edition',
    title: 'Transform your look with stunning wigs',
    ctaText: 'Shop wigs',
    ctaLink: '/shop?category=wigs',
    image: '/new-images/hero-3.jpg',
    imageAlt: 'Wigs on display at CaddyComfort',
  },
];

export const PROMO_CATEGORIES = [
  { label: 'Dresses', href: '/shop?category=dresses' },
  { label: 'Wigs', href: '/shop?category=wigs' },
  { label: 'Bags', href: '/shop?category=bags' },
  { label: 'Shoes', href: '/shop?category=shoes' },
];
