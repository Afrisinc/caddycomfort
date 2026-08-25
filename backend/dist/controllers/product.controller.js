"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.bulkUpdateProducts = exports.getProductStats = exports.getOutOfStockProducts = exports.getLowStockProducts = exports.getFeaturedProducts = exports.getProductInventoryLogs = exports.updateProductStock = exports.deleteProduct = exports.updateProduct = exports.getProductBySlug = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const product_service_1 = require("../services/product.service");
/**
 * Create a new product
 */
const createProduct = async (req, res) => {
    try {
        // Handle field name variations (stock vs stockQuantity)
        const productData = {
            ...req.body,
            stockQuantity: req.body.stockQuantity ?? req.body.stock ?? 0,
        };
        // Remove the 'stock' field if it exists to avoid confusion
        delete productData.stock;
        const product = await product_service_1.ProductService.create(productData);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create product',
        });
    }
};
exports.createProduct = createProduct;
/**
 * Get all products with filters and pagination
 */
const getAllProducts = async (req, res) => {
    try {
        const { categoryId, minPrice, maxPrice, isActive, isFeatured, search, tags, inStock, page, limit, sortBy, sortOrder, } = req.query;
        const filters = {
            categoryId: categoryId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
            search: search,
            tags: tags ? tags.split(',') : undefined,
            inStock: inStock === 'true',
        };
        const pagination = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            sortBy: sortBy,
            sortOrder: sortOrder,
        };
        const result = await product_service_1.ProductService.getAll(filters, pagination);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch products',
        });
        console.log(error.message);
    }
};
exports.getAllProducts = getAllProducts;
/**
 * Get product by ID
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await product_service_1.ProductService.getById(id);
        res.json({
            success: true,
            data: { product },
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Product not found',
        });
    }
};
exports.getProductById = getProductById;
/**
 * Get product by slug
 */
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await product_service_1.ProductService.getBySlug(slug);
        res.json({
            success: true,
            data: { product },
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Product not found',
        });
    }
};
exports.getProductBySlug = getProductBySlug;
/**
 * Update product
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await product_service_1.ProductService.update(id, req.body);
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update product',
        });
    }
};
exports.updateProduct = updateProduct;
/**
 * Delete product
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await product_service_1.ProductService.delete(id);
        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete product',
        });
    }
};
exports.deleteProduct = deleteProduct;
/**
 * Update product stock
 */
const updateProductStock = async (req, res) => {
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
        const product = await product_service_1.ProductService.updateStock(id, quantity, type, reason);
        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: { product },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update stock',
        });
    }
};
exports.updateProductStock = updateProductStock;
/**
 * Get product inventory logs
 */
const getProductInventoryLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit } = req.query;
        const logs = await product_service_1.ProductService.getInventoryLogs(id, limit ? parseInt(limit) : 50);
        res.json({
            success: true,
            data: { logs },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch inventory logs',
        });
    }
};
exports.getProductInventoryLogs = getProductInventoryLogs;
/**
 * Get featured products
 */
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit } = req.query;
        const products = await product_service_1.ProductService.getFeatured(limit ? parseInt(limit) : 10);
        res.json({
            success: true,
            data: { products },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch featured products',
        });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
/**
 * Get low stock products
 */
const getLowStockProducts = async (req, res) => {
    try {
        const { threshold } = req.query;
        const products = await product_service_1.ProductService.getLowStock(threshold ? parseInt(threshold) : 10);
        res.json({
            success: true,
            data: { products },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch low stock products',
        });
    }
};
exports.getLowStockProducts = getLowStockProducts;
/**
 * Get out of stock products
 */
const getOutOfStockProducts = async (req, res) => {
    try {
        const products = await product_service_1.ProductService.getOutOfStock();
        res.json({
            success: true,
            data: { products },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch out of stock products',
        });
    }
};
exports.getOutOfStockProducts = getOutOfStockProducts;
/**
 * Get product statistics
 */
const getProductStats = async (req, res) => {
    try {
        const stats = await product_service_1.ProductService.getStats();
        res.json({
            success: true,
            data: { stats },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch statistics',
        });
    }
};
exports.getProductStats = getProductStats;
/**
 * Bulk update products
 */
const bulkUpdateProducts = async (req, res) => {
    try {
        const { productIds, data } = req.body;
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Product IDs array is required',
            });
            return;
        }
        const result = await product_service_1.ProductService.bulkUpdate(productIds, data);
        res.json({
            success: true,
            message: `${result.count} products updated successfully`,
            data: { count: result.count },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to bulk update products',
        });
    }
};
exports.bulkUpdateProducts = bulkUpdateProducts;
/**
 * Search products
 */
const searchProducts = async (req, res) => {
    try {
        const { q, limit } = req.query;
        if (!q) {
            res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
            return;
        }
        const products = await product_service_1.ProductService.search(q, limit ? parseInt(limit) : 20);
        res.json({
            success: true,
            data: { products },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to search products',
        });
    }
};
exports.searchProducts = searchProducts;
