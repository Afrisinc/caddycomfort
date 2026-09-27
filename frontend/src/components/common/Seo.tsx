import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'CaddyComfort';
export const SITE_URL = (import.meta.env.VITE_APP_URL || 'https://caddycomfort.com').replace(
  /\/$/,
  '',
);
const DEFAULT_TITLE = `${SITE_NAME} | Luxury Fashion`;
const DEFAULT_DESCRIPTION =
  'Discover timeless elegance and contemporary style at CaddyComfort — dresses, shoes, bags and wigs, delivered to your door.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  type?: 'website' | 'product';
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const absolute = (url: string) => (url.startsWith('http') ? url : `${SITE_URL}${url}`);

// index.html ships default tags for crawlers that don't run JS; this updates
// those same elements in place so there is never a duplicate <title>/<meta>.
function setHeadTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const setMeta = (key: 'name' | 'property', id: string, content: string) =>
  setHeadTag(
    `meta[${key}="${id}"]`,
    () => {
      const m = document.createElement('meta');
      m.setAttribute(key, id);
      return m;
    },
    'content',
    content,
  );

export function Seo({ title, description, image, type = 'website', noindex, jsonLd }: SeoProps) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 160);
  const img = image ? absolute(image) : DEFAULT_IMAGE;
  const url = `${SITE_URL}${pathname}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
    setHeadTag(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement('link');
        l.rel = 'canonical';
        return l;
      },
      'href',
      url,
    );
  }, [fullTitle, desc, img, type, url, noindex]);

  if (!jsonLd) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
