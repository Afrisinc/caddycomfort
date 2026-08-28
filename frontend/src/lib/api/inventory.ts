import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import {
  InventorySummary,
  InventoryValuation,
  RestockRecommendation,
  InventoryLogsResult,
  StockAdjustmentInput,
  BulkAdjustResult,
} from '@/types/api';

export const inventoryApi = {
  /**
   * Get inventory summary (Admin only)
   */
  getSummary: async (): Promise<InventorySummary> => {
    try {
      const response = await apiClient.get('/inventory/summary');
      const result = handleApiResponse<{ summary: InventorySummary }>(response).data!;
      return result.summary;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get inventory valuation report (Admin only)
   */
  getValuation: async (): Promise<InventoryValuation> => {
    try {
      const response = await apiClient.get('/inventory/valuation');
      return handleApiResponse<InventoryValuation>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get restock recommendations (Admin only)
   */
  getRestockRecommendations: async (threshold = 10): Promise<RestockRecommendation[]> => {
    try {
      const response = await apiClient.get('/inventory/restock-recommendations', { params: { threshold } });
      const result = handleApiResponse<{ recommendations: RestockRecommendation[] }>(response).data!;
      return result.recommendations;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get inventory logs for a single product (Admin only)
   */
  getProductLogs: async (productId: string, page = 1, limit = 20): Promise<InventoryLogsResult> => {
    try {
      const response = await apiClient.get(`/inventory/logs/product/${productId}`, { params: { page, limit } });
      return handleApiResponse<InventoryLogsResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Adjust stock for a single product (Admin only)
   */
  adjustStock: async (input: StockAdjustmentInput): Promise<void> => {
    try {
      const response = await apiClient.post('/inventory/adjust', input);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Adjust stock for multiple products at once (Admin only)
   */
  bulkAdjustStock: async (adjustments: StockAdjustmentInput[]): Promise<BulkAdjustResult> => {
    try {
      const response = await apiClient.post('/inventory/bulk-adjust', { adjustments });
      return handleApiResponse<BulkAdjustResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
