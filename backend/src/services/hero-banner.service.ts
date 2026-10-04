import type { HeroBanner } from '@prisma/client';
import prisma from '../config/database';
import { CACHE_TTL, cache } from '../utils/cache';
import { deleteImage, isValidBase64Image, uploadBase64Image } from '../utils/cloudinary';

export class HeroBannerValidationError extends Error {}

export interface HeroBannerInput {
  eyebrow?: unknown;
  title?: unknown;
  ctaText?: unknown;
  ctaLink?: unknown;
  image?: unknown;
  imageAlt?: unknown;
  isActive?: unknown;
}

const TEXT_LIMITS = {
  eyebrow: 60,
  title: 120,
  ctaText: 40,
  ctaLink: 300,
  imageAlt: 160,
} as const;

const TEXT_LABELS: Record<keyof typeof TEXT_LIMITS, string> = {
  eyebrow: 'Label',
  title: 'Headline',
  ctaText: 'Button text',
  ctaLink: 'Button link',
  imageAlt: 'Image description',
};

const TRANSFORMATION = [
  { width: 2400, height: 1600, crop: 'limit' },
  { quality: 'auto:best' },
  { format: 'webp' },
];

const isInternalPath = (value: string) => value.startsWith('/') && !value.startsWith('//');
const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

function readText(
  input: HeroBannerInput,
  field: keyof typeof TEXT_LIMITS,
  required: boolean,
): string | undefined {
  const raw = input[field];
  if (raw === undefined) {
    if (required) throw new HeroBannerValidationError(`${TEXT_LABELS[field]} is required`);
    return undefined;
  }
  if (typeof raw !== 'string')
    throw new HeroBannerValidationError(`${TEXT_LABELS[field]} is invalid`);
  const value = raw.trim();
  if (!value) throw new HeroBannerValidationError(`${TEXT_LABELS[field]} is required`);
  if (value.length > TEXT_LIMITS[field]) {
    throw new HeroBannerValidationError(
      `${TEXT_LABELS[field]} must be ${TEXT_LIMITS[field]} characters or fewer`,
    );
  }
  return value;
}

function readLink(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (!isInternalPath(value) && !isHttpUrl(value)) {
    throw new HeroBannerValidationError(
      'Button link must start with / or https:// (for example /shop)',
    );
  }
  return value;
}

async function resolveImage(value: unknown): Promise<string | undefined> {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value) throw new HeroBannerValidationError('Image is required');
  if (isValidBase64Image(value)) {
    try {
      return await uploadBase64Image(value, {
        folder: 'clementine-shop/banners',
        transformation: TRANSFORMATION,
      });
    } catch (error: any) {
      throw new HeroBannerValidationError(`Failed to upload banner image: ${error.message}`);
    }
  }
  if (isInternalPath(value) || isHttpUrl(value)) return value;
  throw new HeroBannerValidationError('Invalid image format. Provide an upload or a URL.');
}

function discardImage(url: string) {
  if (!url.includes('cloudinary.com')) return;
  deleteImage(url).catch((error) => console.error('Failed to delete banner image:', error));
}

export class HeroBannerService {
  static async getActive(): Promise<HeroBanner[]> {
    return cache.getOrSet('settings', ['hero-banners', 'active'], CACHE_TTL.medium, () =>
      prisma.heroBanner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
    );
  }

  static async getAll(): Promise<HeroBanner[]> {
    return prisma.heroBanner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  static async getById(id: string): Promise<HeroBanner> {
    const banner = await prisma.heroBanner.findUnique({ where: { id } });
    if (!banner) throw new HeroBannerValidationError('Banner not found');
    return banner;
  }

  static async create(input: HeroBannerInput): Promise<HeroBanner> {
    const eyebrow = readText(input, 'eyebrow', true)!;
    const title = readText(input, 'title', true)!;
    const ctaText = readText(input, 'ctaText', true)!;
    const ctaLink = readLink(readText(input, 'ctaLink', true))!;
    const imageAlt = readText(input, 'imageAlt', true)!;
    if (input.image === undefined) throw new HeroBannerValidationError('Image is required');
    const image = (await resolveImage(input.image))!;

    const last = await prisma.heroBanner.aggregate({ _max: { sortOrder: true } });
    const banner = await prisma.heroBanner.create({
      data: {
        eyebrow,
        title,
        ctaText,
        ctaLink,
        image,
        imageAlt,
        isActive: input.isActive === undefined ? true : input.isActive === true,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
      },
    });
    await cache.invalidate('settings');
    return banner;
  }

  static async update(id: string, input: HeroBannerInput): Promise<HeroBanner> {
    const current = await this.getById(id);
    const data = {
      eyebrow: readText(input, 'eyebrow', false),
      title: readText(input, 'title', false),
      ctaText: readText(input, 'ctaText', false),
      ctaLink: readLink(readText(input, 'ctaLink', false)),
      imageAlt: readText(input, 'imageAlt', false),
      image: input.image === current.image ? undefined : await resolveImage(input.image),
      isActive: typeof input.isActive === 'boolean' ? input.isActive : undefined,
    };

    const banner = await prisma.heroBanner.update({ where: { id }, data });
    if (data.image && data.image !== current.image) discardImage(current.image);
    await cache.invalidate('settings');
    return banner;
  }

  static async reorder(ids: unknown): Promise<HeroBanner[]> {
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      throw new HeroBannerValidationError('Provide the banner ids in the new order');
    }
    const existing = await prisma.heroBanner.findMany({ select: { id: true } });
    const known = new Set(existing.map((b) => b.id));
    if (
      ids.length !== known.size ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !known.has(id))
    ) {
      throw new HeroBannerValidationError('Banner list is out of date. Refresh and try again.');
    }
    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.heroBanner.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    await cache.invalidate('settings');
    return this.getAll();
  }

  static async delete(id: string): Promise<void> {
    const banner = await this.getById(id);
    await prisma.heroBanner.delete({ where: { id } });
    discardImage(banner.image);
    await cache.invalidate('settings');
  }
}
