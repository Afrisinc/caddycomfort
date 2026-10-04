import apiClient, {
  UPLOAD_REQUEST_CONFIG,
  handleApiError,
  handleApiResponse,
} from '@/lib/api-client';
import type { HeroBanner } from '@/types/api';

export interface HeroBannerPayload {
  eyebrow: string;
  title: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
}

const unwrapList = (response: Parameters<typeof handleApiResponse>[0]) =>
  handleApiResponse<{ banners: HeroBanner[] }>(response).data!.banners;

const unwrapOne = (response: Parameters<typeof handleApiResponse>[0]) =>
  handleApiResponse<{ banner: HeroBanner }>(response).data!.banner;

export const heroBannersApi = {
  getActive: async (): Promise<HeroBanner[]> => {
    try {
      return unwrapList(await apiClient.get('/hero-banners'));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAll: async (): Promise<HeroBanner[]> => {
    try {
      return unwrapList(await apiClient.get('/hero-banners/admin/all'));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (id: string): Promise<HeroBanner> => {
    try {
      return unwrapOne(await apiClient.get(`/hero-banners/admin/${id}`));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (data: HeroBannerPayload): Promise<HeroBanner> => {
    try {
      return unwrapOne(await apiClient.post('/hero-banners', data, UPLOAD_REQUEST_CONFIG));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (id: string, data: Partial<HeroBannerPayload>): Promise<HeroBanner> => {
    try {
      return unwrapOne(await apiClient.put(`/hero-banners/${id}`, data, UPLOAD_REQUEST_CONFIG));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  reorder: async (ids: string[]): Promise<HeroBanner[]> => {
    try {
      return unwrapList(await apiClient.put('/hero-banners/admin/reorder', { ids }));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      handleApiResponse(await apiClient.delete(`/hero-banners/${id}`));
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
