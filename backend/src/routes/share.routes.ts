import { Request, Router } from 'express';
import prisma from '../config/database';
import { logger } from '../config/logger';
import { CACHE_TTL, cache } from '../utils/cache';

const router = Router();

const SITE_NAME = 'CaddyComfort';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const escapeHtml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' })[c]!,
  );

function toShareImage(url: string, origin: string): { url: string; sized: boolean } {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return { url: url.startsWith('http') ? url : `${origin}${url}`, sized: false };
  }
  const transform = `c_pad,b_auto,w_${OG_WIDTH},h_${OG_HEIGHT},f_jpg,q_auto`;
  return { url: url.replace('/upload/', `/upload/${transform}/`), sized: true };
}

async function buildProductPage(id: string, origin: string): Promise<string | null> {
  const product = await prisma.product.findFirst({
    where: { isActive: true, OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      salePrice: true,
      imageUrl: true,
      images: true,
      stockQuantity: true,
    },
  });
  if (!product) return null;

  const pageUrl = `${origin}/shop/${product.id}`;
  const title = `${product.name} | ${SITE_NAME}`;
  const description = product.description.replace(/\s+/g, ' ').trim().slice(0, 160);
  const source = product.images[0] || product.imageUrl;
  const image = source
    ? toShareImage(source, origin)
    : { url: `${origin}/og-image.png`, sized: false };
  const price = product.salePrice ?? product.price;
  const availability = product.stockQuantity > 0 ? 'instock' : 'oos';

  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(pageUrl);
  const img = escapeHtml(image.url);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${u}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${u}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:secure_url" content="${img}" />
    <meta property="og:image:alt" content="${escapeHtml(product.name)}" />
${
  image.sized
    ? `    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="${OG_WIDTH}" />
    <meta property="og:image:height" content="${OG_HEIGHT}" />
`
    : ''
}    <meta property="product:price:amount" content="${price}" />
    <meta property="product:price:currency" content="RWF" />
    <meta property="product:availability" content="${availability}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <meta name="twitter:image:alt" content="${escapeHtml(product.name)}" />
  </head>
  <body>
    <h1>${escapeHtml(product.name)}</h1>
    <img src="${img}" alt="${escapeHtml(product.name)}" />
    <p>${d}</p>
    <a href="${u}">View on ${SITE_NAME}</a>
  </body>
</html>
`;
}

const requestOrigin = (req: Request) => `${req.protocol}://${req.get('host')}`;

router.get('/product/:id', async (req, res) => {
  const origin = requestOrigin(req);
  try {
    const { id } = req.params;
    const html = await cache.getOrSet('products', ['share', origin, id], CACHE_TTL.long, () =>
      buildProductPage(id, origin),
    );
    if (!html) {
      res.redirect(302, `${origin}/shop`);
      return;
    }
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch (error) {
    logger.error({ err: error }, 'Failed to build product share page');
    res.redirect(302, `${origin}/shop`);
  }
});

export default router;
