import { Category } from '@prisma/client';
import { uploadBase64Image, deleteImage, isValidBase64Image } from '../utils/cloudinary';
import prisma from '../config/database';

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
}

interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export class CategoryService {
  /**
   * Create a new category
   */
  static async create(data: CreateCategoryData): Promise<Category> {
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
    let imageUrl: string | undefined;
    if (data.image) {
      if (isValidBase64Image(data.image)) {
        try {
          imageUrl = await uploadBase64Image(data.image, {
            folder: 'clementine-shop/categories',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { format: 'webp' },
            ],
          });
        } catch (error: any) {
          throw new Error(`Failed to upload category image: ${error.message}`);
        }
      } else if (data.image.startsWith('http')) {
        // Image is already a URL (e.g., from external source)
        imageUrl = data.image;
      } else {
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
  static async getAll(options?: { includeChildren?: boolean; parentId?: string | null }) {
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
  static async getById(id: string) {
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
  static async getBySlug(slug: string) {
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
  static async update(id: string, data: UpdateCategoryData): Promise<Category> {
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
    let imageUrl: string | undefined = data.image;
    if (data.image && data.image !== category.image) {
      if (isValidBase64Image(data.image)) {
        try {
          // Upload new image
          imageUrl = await uploadBase64Image(data.image, {
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
              await deleteImage(category.image);
            } catch (error) {
              console.error('Failed to delete old category image:', error);
            }
          }
        } catch (error: any) {
          throw new Error(`Failed to upload category image: ${error.message}`);
        }
      } else if (!data.image.startsWith('http')) {
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
  static async delete(id: string): Promise<void> {
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
        await deleteImage(category.image);
      } catch (error) {
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
  private static async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    let currentId: string | null = descendantId;

    while (currentId) {
      const category: { parentId: string | null } | null = await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      if (!category) break;

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
