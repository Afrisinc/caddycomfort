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
    eyebrow: 'Move in comfort',
    title: 'Gym wear that moves with your body, not against it',
    ctaText: 'Shop gym wear',
    ctaLink: '/shop',
    image: '/new-images/hero-1.jpg',
    imageAlt: 'Featured pieces from the CaddyComfort collection',
  },
  {
    eyebrow: 'Train, travel, live',
    title: 'From your workout to the rest of your day',
    ctaText: 'Shop the collection',
    ctaLink: '/shop',
    image: '/new-images/hero-4.jpg',
    imageAlt: 'Pieces from the CaddyComfort collection',
  },
  {
    eyebrow: 'More coverage, your way',
    title: 'Options for every body and every reason',
    ctaText: 'Find your fit',
    ctaLink: '/shop',
    image: '/new-images/hero-3.jpg',
    imageAlt: 'Pieces on display at CaddyComfort',
  },
];

export const PROMO_CATEGORIES = [
  { label: 'Leggings', href: '/search?q=leggings' },
  { label: 'Sports bras', href: '/search?q=sports%20bra' },
  { label: 'Tops', href: '/search?q=top' },
  { label: 'Gym accessories', href: '/search?q=accessories' },
];
