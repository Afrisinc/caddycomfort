import { Router } from 'express';
import prisma from '../config/database';
import { logger } from '../config/logger';

const router = Router();

const SITE_URL = (process.env.PUBLIC_APP_URL || 'https://caddycomfort.com').replace(/\/$/, '');

const STATIC_PATHS = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/faq', priority: '0.4', changefreq: 'monthly' },
  { path: '/shipping', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
  { path: '/terms', priority: '0.2', changefreq: 'yearly' },
];

const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!,
  );

const urlEntry = (loc: string, lastmod?: Date, changefreq?: string, priority?: string) =>
  [
    '  <url>',
    `    <loc>${escapeXml(SITE_URL + loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');

// Served at /sitemap.xml by the frontend nginx, which proxies here.
router.get('/', async (_req, res) => {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const entries = [
      ...STATIC_PATHS.map((p) => urlEntry(p.path, undefined, p.changefreq, p.priority)),
      ...categories.map((c) =>
        urlEntry(`/shop?category=${encodeURIComponent(c.slug)}`, c.updatedAt, 'weekly', '0.7'),
      ),
      ...products.map((p) => urlEntry(`/shop/${p.id}`, p.updatedAt, 'weekly', '0.8')),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    logger.error({ err: error }, 'Failed to build sitemap');
    res.status(500).type('text/plain').send('Sitemap unavailable');
  }
});

export default router;
