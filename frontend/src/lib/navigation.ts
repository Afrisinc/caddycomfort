export interface NavItem {
  label: string;
  href: string;
}

export const NAV_LINKS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Women', href: '/shop?category=womans-cloth' },
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Kids', href: '/shop?category=kids' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const ADMIN_LINK: NavItem = { label: 'Admin', href: '/admin' };

export function isNavActive(href: string, pathname: string, search: string): boolean {
  const [path, query = ''] = href.split('?');
  const category = new URLSearchParams(query).get('category');
  const currentCategory = new URLSearchParams(search).get('category');

  if (path === '/') return pathname === '/';
  if (category) return pathname === path && currentCategory === category;
  if (path === '/shop') return pathname.startsWith('/shop') && !currentCategory;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function formatCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}

export function safeRedirect(target: string | null | undefined, fallback: string): string {
  return target?.startsWith('/') && !target.startsWith('//') ? target : fallback;
}
