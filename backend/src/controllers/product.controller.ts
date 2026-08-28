import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Handle field name variations (stock vs stockQuantity)
    const productData = {
      ...req.body,
      stockQuantity: req.body.stockQuantity ?? req.body.stock ?? 0,
    };

    // Remove the 'stock' field if it exists to avoid confusion
    delete productData.stock;

    const product = await ProductService.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

/**
 * Get all products with filters and pagination
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      search,
      tags,
      sizes,
      colors,
      inStock,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    // Accepts repeated query keys (?sizes=S&sizes=M), a single value, or a
    // comma-separated string, and normalizes to a string array.
    const toStringArray = (value: unknown): string[] | undefined => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value.map(String);
      return String(value).split(',').filter(Boolean);
    };

    const filters = {
      categoryId: categoryId as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
      search: search as string,
      tags: toStringArray(tags),
      sizes: toStringArray(sizes),
      colors: toStringArray(colors),
      inStock: inStock === 'true',
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    const result = await ProductService.getAll(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
    console.log(error.message);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await ProductService.getById(id);

    res.json({
      success: true,
      data: { product },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Product not found',
    });
  }
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await ProductService.getBySlug(slug);

    res.json({
      success: true,
      data: { product },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Product not found',
    });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await ProductService.update(id, req.body);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await ProductService.delete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
};

/**
 * Update product stock
 */
export const updateProductStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, type, reason } = req.body;

    if (!quantity || !type) {
      res.status(400).json({
        success: false,
        message: 'Quantity and type are required',
      });
      return;
    }

    const product = await ProductService.updateStock(id, quantity, type, reason);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { product },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update stock',
    });
  }
};

/**
 * Get product inventory logs
 */
export const getProductInventoryLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const logs = await ProductService.getInventoryLogs(
      id,
      limit ? parseInt(limit as string) : 50
    );

    res.json({
      success: true,
      data: { logs },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch inventory logs',
    });
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;
    const products = await ProductService.getFeatured(
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch featured products',
    });
  }
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { threshold } = req.query;
    const products = await ProductService.getLowStock(
      threshold ? parseInt(threshold as string) : 10
    );

    res.json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch low stock products',
    });
  }
};

/**
 * Get out of stock products
 */
export const getOutOfStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await ProductService.getOutOfStock();

    res.json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch out of stock products',
    });
  }
};

/**
 * Get product statistics
 */
export const getProductStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await ProductService.getStats();

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
    });
  }
};

/**
 * Bulk update products
 */
export const bulkUpdateProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, data } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Product IDs array is required',
      });
      return;
    }

    const result = await ProductService.bulkUpdate(productIds, data);

    res.json({
      success: true,
      message: `${result.count} products updated successfully`,
      data: { count: result.count },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to bulk update products',
    });
  }
};

/**
 * Search products
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
      return;
    }

    const products = await ProductService.search(
      q as string,
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search products',
    });
  }
};
