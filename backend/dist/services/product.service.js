"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const prisma = new client_1.PrismaClient();
class ProductService {
    /**
     * Create a new product
     */
    static async create(data) {
        // Check if slug already exists
        const existingSlug = await prisma.product.findUnique({
            where: { slug: data.slug },
        });
        if (existingSlug) {
            throw new Error('Product slug already exists');
        }
        // Check if SKU already exists
        const existingSku = await prisma.product.findUnique({
            where: { sku: data.sku },
        });
        if (existingSku) {
            throw new Error('Product SKU already exists');
        }
        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });
        if (!category) {
            throw new Error('Category not found');
        }
        // Upload images to Cloudinary if provided
        let imageUrls = [];
        if (data.images && data.images.length > 0) {
            const base64Images = data.images.filter(img => (0, cloudinary_1.isValidBase64Image)(img));
            const urlImages = data.images.filter(img => img.startsWith('http'));
            if (base64Images.length > 0) {
                try {
                    const uploadedUrls = await (0, cloudinary_1.uploadMultipleBase64Images)(base64Images, {
                        folder: 'clementine-shop/products',
                        transformation: [
                            { width: 1200, height: 1200, crop: 'limit' },
                            { quality: 'auto' },
                            { format: 'webp' },
                        ],
                    });
                    imageUrls = [...uploadedUrls, ...urlImages];
                }
                catch (error) {
                    throw new Error(`Failed to upload product images: ${error.message}`);
                }
            }
            else {
                imageUrls = urlImages;
            }
        }
        // Create product
        const product = await prisma.product.create({
            data: {
                ...data,
                images: imageUrls,
                sizes: data.sizes || [],
                colors: data.colors || [],
                tags: data.tags || [],
                stockQuantity: data.stockQuantity || 0,
            },
            include: {
                category: true,
            },
        });
        // Log initial inventory
        await prisma.inventoryLog.create({
            data: {
                productId: product.id,
                type: 'RESTOCK',
                quantity: product.stockQuantity,
                reason: 'Initial stock',
            },
        });
        return product;
    }
    /**
     * Get all products with filters and pagination
     */
    static async getAll(filters, pagination) {
        const { categoryId, minPrice, maxPrice, isActive, isFeatured, search, tags, inStock, } = filters || {};
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = pagination || {};
        // Build where clause
        const where = {
            ...(categoryId && { categoryId }),
            ...(isActive !== undefined && { isActive }),
            ...(isFeatured !== undefined && { isFeatured }),
            ...(inStock && { stockQuantity: { gt: 0 } }),
            ...(minPrice !== undefined && { price: { gte: minPrice } }),
            ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(tags && tags.length > 0 && {
                tags: { hasSome: tags },
            }),
        };
        // Execute queries
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    _count: {
                        select: { reviews: true, orderItems: true },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get product by ID
     */
    static async getById(id) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    include: {
                        parent: true,
                    },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: {
                    select: { reviews: true, orderItems: true },
                },
            },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        // Calculate average rating
        const avgRating = await prisma.review.aggregate({
            where: { productId: id },
            _avg: { rating: true },
        });
        return {
            ...product,
            averageRating: avgRating._avg.rating || 0,
        };
    }
    /**
     * Get product by slug
     */
    static async getBySlug(slug) {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    /**
     * Update product
     */
    static async update(id, data) {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        // Check if new slug is unique (if provided)
        if (data.slug && data.slug !== product.slug) {
            const existingSlug = await prisma.product.findUnique({
                where: { slug: data.slug },
            });
            if (existingSlug) {
                throw new Error('Product slug already exists');
            }
        }
        // Check if new SKU is unique (if provided)
        if (data.sku && data.sku !== product.sku) {
            const existingSku = await prisma.product.findUnique({
                where: { sku: data.sku },
            });
            if (existingSku) {
                throw new Error('Product SKU already exists');
            }
        }
        // Verify category exists (if provided)
        if (data.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: data.categoryId },
            });
            if (!category) {
                throw new Error('Category not found');
            }
        }
        // Handle image updates
        let imageUrls = data.images;
        if (data.images && data.images.length > 0) {
            const base64Images = data.images.filter(img => (0, cloudinary_1.isValidBase64Image)(img));
            const urlImages = data.images.filter(img => img.startsWith('http'));
            if (base64Images.length > 0) {
                try {
                    // Upload new base64 images
                    const uploadedUrls = await (0, cloudinary_1.uploadMultipleBase64Images)(base64Images, {
                        folder: 'clementine-shop/products',
                        transformation: [
                            { width: 1200, height: 1200, crop: 'limit' },
                            { quality: 'auto' },
                            { format: 'webp' },
                        ],
                    });
                    imageUrls = [...uploadedUrls, ...urlImages];
                    // Delete old images from Cloudinary if they're not in the new list
                    const oldCloudinaryImages = product.images.filter(img => img.includes('cloudinary.com') && !urlImages.includes(img));
                    if (oldCloudinaryImages.length > 0) {
                        try {
                            await (0, cloudinary_1.deleteMultipleImages)(oldCloudinaryImages);
                        }
                        catch (error) {
                            console.error('Failed to delete old product images:', error);
                        }
                    }
                }
                catch (error) {
                    throw new Error(`Failed to upload product images: ${error.message}`);
                }
            }
        }
        // Update product
        const updated = await prisma.product.update({
            where: { id },
            data: {
                ...data,
                images: imageUrls,
            },
            include: {
                category: true,
            },
        });
        return updated;
    }
    /**
     * Delete product
     */
    static async delete(id) {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                orderItems: true,
                cartItems: true,
            },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        // Check if product has been ordered
        if (product.orderItems.length > 0) {
            throw new Error('Cannot delete product with existing orders. Consider deactivating instead.');
        }
        // Remove from carts
        if (product.cartItems.length > 0) {
            await prisma.cartItem.deleteMany({
                where: { productId: id },
            });
        }
        // Delete product images from Cloudinary
        const cloudinaryImages = product.images.filter(img => img.includes('cloudinary.com'));
        if (cloudinaryImages.length > 0) {
            try {
                await (0, cloudinary_1.deleteMultipleImages)(cloudinaryImages);
            }
            catch (error) {
                console.error('Failed to delete product images from Cloudinary:', error);
            }
        }
        // Delete product
        await prisma.product.delete({
            where: { id },
        });
    }
    /**
     * Update product stock
     */
    static async updateStock(productId, quantity, type, reason) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        const previousQty = product.stockQuantity;
        const newQty = type === 'RESTOCK' || type === 'RETURN' || type === 'ADJUSTMENT'
            ? previousQty + quantity
            : previousQty - quantity;
        if (newQty < 0) {
            throw new Error('Insufficient stock');
        }
        // Update product stock
        const updated = await prisma.product.update({
            where: { id: productId },
            data: { stockQuantity: newQty },
        });
        // Log inventory change
        await prisma.inventoryLog.create({
            data: {
                productId,
                type,
                quantity,
                reason,
            },
        });
        return updated;
    }
    /**
     * Get product inventory logs
     */
    static async getInventoryLogs(productId, limit = 50) {
        return prisma.inventoryLog.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    /**
     * Get featured products
     */
    static async getFeatured(limit = 10) {
        return prisma.product.findMany({
            where: {
                isFeatured: true,
                isActive: true,
                stockQuantity: { gt: 0 },
            },
            include: {
                category: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    /**
     * Get low stock products
     */
    static async getLowStock(threshold = 10) {
        return prisma.product.findMany({
            where: {
                stockQuantity: { lte: threshold, gt: 0 },
                isActive: true,
            },
            include: {
                category: true,
            },
            orderBy: { stockQuantity: 'asc' },
        });
    }
    /**
     * Get out of stock products
     */
    static async getOutOfStock() {
        return prisma.product.findMany({
            where: {
                stockQuantity: 0,
                isActive: true,
            },
            include: {
                category: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    /**
     * Get product statistics
     */
    static async getStats() {
        const [total, active, featured, inStock, lowStock, outOfStock,] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.product.count({ where: { isFeatured: true } }),
            prisma.product.count({ where: { stockQuantity: { gt: 10 } } }),
            prisma.product.count({ where: { stockQuantity: { lte: 10, gt: 0 } } }),
            prisma.product.count({ where: { stockQuantity: 0 } }),
        ]);
        return {
            total,
            active,
            inactive: total - active,
            featured,
            inStock,
            lowStock,
            outOfStock,
        };
    }
    /**
     * Bulk update products
     */
    static async bulkUpdate(productIds, data) {
        return prisma.product.updateMany({
            where: { id: { in: productIds } },
            data,
        });
    }
    /**
     * Search products
     */
    static async search(query, limit = 20) {
        return prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                    { tags: { hasSome: [query] } },
                ],
                isActive: true,
            },
            include: {
                category: true,
            },
            take: limit,
        });
    }
}
exports.ProductService = ProductService;
