import { Request, Response } from 'express';
import { HeroBannerService, HeroBannerValidationError } from '../services/hero-banner.service';

const fail = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof HeroBannerValidationError) {
    const status = error.message === 'Banner not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
    return;
  }
  res.status(500).json({ success: false, message: fallback });
};

export const getActiveHeroBanners = async (_req: Request, res: Response): Promise<void> => {
  try {
    const banners = await HeroBannerService.getActive();
    res.json({ success: true, data: { banners } });
  } catch (error) {
    fail(res, error, 'Failed to fetch banners');
  }
};

export const getAllHeroBanners = async (_req: Request, res: Response): Promise<void> => {
  try {
    const banners = await HeroBannerService.getAll();
    res.json({ success: true, data: { banners } });
  } catch (error) {
    fail(res, error, 'Failed to fetch banners');
  }
};

export const getHeroBannerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const banner = await HeroBannerService.getById(req.params.id);
    res.json({ success: true, data: { banner } });
  } catch (error) {
    fail(res, error, 'Failed to fetch banner');
  }
};

export const createHeroBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const banner = await HeroBannerService.create(req.body ?? {});
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: { banner },
    });
  } catch (error) {
    fail(res, error, 'Failed to create banner');
  }
};

export const updateHeroBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const banner = await HeroBannerService.update(req.params.id, req.body ?? {});
    res.json({ success: true, message: 'Banner updated successfully', data: { banner } });
  } catch (error) {
    fail(res, error, 'Failed to update banner');
  }
};

export const reorderHeroBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await HeroBannerService.reorder(req.body?.ids);
    res.json({ success: true, data: { banners } });
  } catch (error) {
    fail(res, error, 'Failed to reorder banners');
  }
};

export const deleteHeroBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    await HeroBannerService.delete(req.params.id);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    fail(res, error, 'Failed to delete banner');
  }
};
