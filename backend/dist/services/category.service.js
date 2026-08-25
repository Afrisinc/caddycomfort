"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const prisma = new client_1.PrismaClient();
class CategoryService {
    /**
     * Create a new category
     */
    static async create(data) {
        // Check if slug already exists
        const existingSlug = await prisma.category.findUnique({
            where: { slug: data.slug },
        });
        if (existingSlug) {
            throw new Error('Category slug already exists');
        }
        // Check if name already exists
        const existingName = await prisma.category.findUnique({
            where: { name: data.name },
        });
        if (existingName) {
            throw new Error('Category name already exists');
        }
        // If parentId is provided, verify it exists
        if (data.parentId) {
            const parentExists = await prisma.category.findUnique({
                where: { id: data.parentId },
            });
            if (!parentExists) {
                throw new Error('Parent category not found');
            }
        }
        // Upload image to Cloudinary if provided
        let imageUrl;
        if (data.image) {
            if ((0, cloudinary_1.isValidBase64Image)(data.image)) {
                try {
                    imageUrl = await (0, cloudinary_1.uploadBase64Image)(data.image, {
                        folder: 'clementine-shop/categories',
                        transformation: [
                            { width: 800, height: 600, crop: 'limit' },
                            { quality: 'auto' },
                            { format: 'webp' },
                        ],
                    });
                }
                catch (error) {
                    throw new Error(`Failed to upload category image: ${error.message}`);
                }
            }
            else if (data.image.startsWith('http')) {
                // Image is already a URL (e.g., from external source)
                imageUrl = data.image;
            }
            else {
                throw new Error('Invalid image format. Provide base64 or URL.');
            }
        }
        return prisma.category.create({
            data: {
                ...data,
                image: imageUrl,
            },
            include: {
                parent: true,
                children: true,
            },
        });
    }
    /**
     * Get all categories with optional filters
     */
    static async getAll(options) {
        const { includeChildren = true, parentId } = options || {};
        const where = parentId !== undefined ? { parentId } : {};
        return prisma.category.findMany({
            where,
            include: {
                parent: true,
                children: includeChildren,
                _count: {
                    select: { products: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    /**
     * Get category by ID
     */
    static async getById(id) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                products: {
                    where: { isActive: true },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }
    /**
     * Get category by slug
     */
    static async getBySlug(slug) {
        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }
    /**
     * Update category
     */
    static async update(id, data) {
        // Check if category exists
        const category = await prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new Error('Category not found');
        }
        // Check if new slug is unique (if provided)
        if (data.slug && data.slug !== category.slug) {
            const existingSlug = await prisma.category.findUnique({
                where: { slug: data.slug },
            });
            if (existingSlug) {
                throw new Error('Category slug already exists');
            }
        }
        // Check if new name is unique (if provided)
        if (data.name && data.name !== category.name) {
            const existingName = await prisma.category.findUnique({
                where: { name: data.name },
            });
            if (existingName) {
                throw new Error('Category name already exists');
            }
        }
        // Prevent circular parent relationships
        if (data.parentId) {
            if (data.parentId === id) {
                throw new Error('Category cannot be its own parent');
            }
            // Check if the new parent is a descendant of this category
            const isDescendant = await this.isDescendant(id, data.parentId);
            if (isDescendant) {
                throw new Error('Cannot set a descendant category as parent');
            }
        }
        // Handle image update
        let imageUrl = data.image;
        if (data.image && data.image !== category.image) {
            if ((0, cloudinary_1.isValidBase64Image)(data.image)) {
                try {
                    // Upload new image
                    imageUrl = await (0, cloudinary_1.uploadBase64Image)(data.image, {
                        folder: 'clementine-shop/categories',
                        transformation: [
                            { width: 800, height: 600, crop: 'limit' },
                            { quality: 'auto' },
                            { format: 'webp' },
                        ],
                    });
                    // Delete old image if it exists and is from Cloudinary
                    if (category.image && category.image.includes('cloudinary.com')) {
                        try {
                            await (0, cloudinary_1.deleteImage)(category.image);
                        }
                        catch (error) {
                            console.error('Failed to delete old category image:', error);
                        }
                    }
                }
                catch (error) {
                    throw new Error(`Failed to upload category image: ${error.message}`);
                }
            }
            else if (!data.image.startsWith('http')) {
                throw new Error('Invalid image format. Provide base64 or URL.');
            }
        }
        return prisma.category.update({
            where: { id },
            data: {
                ...data,
                image: imageUrl,
            },
            include: {
                parent: true,
                children: true,
            },
        });
    }
    /**
     * Delete category
     */
    static async delete(id) {
        // Check if category exists
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                products: true,
            },
        });
        if (!category) {
            throw new Error('Category not found');
        }
        // Check if category has children
        if (category.children.length > 0) {
            throw new Error('Cannot delete category with subcategories');
        }
        // Check if category has products
        if (category.products.length > 0) {
            throw new Error('Cannot delete category with products');
        }
        // Delete category image from Cloudinary if exists
        if (category.image && category.image.includes('cloudinary.com')) {
            try {
                await (0, cloudinary_1.deleteImage)(category.image);
            }
            catch (error) {
                console.error('Failed to delete category image from Cloudinary:', error);
            }
        }
        await prisma.category.delete({
            where: { id },
        });
    }
    /**
     * Get category tree (hierarchical structure)
     */
    static async getTree() {
        // Get all root categories (no parent)
        const rootCategories = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: true,
                        _count: {
                            select: { products: true },
                        },
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
        return rootCategories;
    }
    /**
     * Check if a category is a descendant of another
     */
    static async isDescendant(ancestorId, descendantId) {
        let currentId = descendantId;
        while (currentId) {
            const category = await prisma.category.findUnique({
                where: { id: currentId },
                select: { parentId: true },
            });
            if (!category)
                break;
            if (category.parentId === ancestorId) {
                return true;
            }
            currentId = category.parentId;
        }
        return false;
    }
    /**
     * Get category statistics
     */
    static async getStats() {
        const [totalCategories, rootCategories, categoriesWithProducts] = await Promise.all([
            prisma.category.count(),
            prisma.category.count({ where: { parentId: null } }),
            prisma.category.count({
                where: {
                    products: {
                        some: {},
                    },
                },
            }),
        ]);
        return {
            total: totalCategories,
            root: rootCategories,
            withProducts: categoriesWithProducts,
            empty: totalCategories - categoriesWithProducts,
        };
    }
}
exports.CategoryService = CategoryService;
