import { WishlistItem } from '@prisma/client';
import prisma from '../config/database';

interface WishlistItemWithProduct extends WishlistItem {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    comparePrice: number | null;
    imageUrl: string | null;
    images: string[];
    stockQuantity: number;
    isActive: boolean;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export class WishlistService {
  /**
   * Get user's wishlist
   */
  static async getUserWishlist(userId: string): Promise<WishlistItemWithProduct[]> {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<WishlistItemWithProduct[]>;
  }

  /**
   * Add product to wishlist
   */
  static async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new Error('Product already in wishlist');
    }

    return prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
    });
  }

  /**
   * Remove product from wishlist
   */
  static async removeFromWishlist(userId: string, wishlistItemId: string): Promise<void> {
    const item = await prisma.wishlistItem.findFirst({
      where: {
        id: wishlistItemId,
        userId,
      },
    });

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
    });
  }

  /**
   * Remove product from wishlist by product ID
   */
  static async removeByProductId(userId: string, productId: string): Promise<void> {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!item) {
      throw new Error('Product not in wishlist');
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  /**
   * Check if product is in wishlist
   */
  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!item;
  }

  /**
   * Clear entire wishlist
   */
  static async clearWishlist(userId: string): Promise<number> {
    const result = await prisma.wishlistItem.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  /**
   * Get wishlist count
   */
  static async getCount(userId: string): Promise<number> {
    return prisma.wishlistItem.count({
      where: { userId },
    });
  }

  /**
   * Move wishlist items to cart
   */
  static async moveToCart(userId: string): Promise<number> {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (wishlistItems.length === 0) {
      return 0;
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    let movedCount = 0;

    for (const item of wishlistItems) {
      // Check if product is in stock and active
      if (item.product.isActive && item.product.stockQuantity > 0) {
        // Check if already in cart
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: item.productId,
          },
        });

        if (!existingCartItem) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              userId,
              productId: item.productId,
              quantity: 1,
            },
          });
          movedCount++;
        }

        // Remove from wishlist
        await prisma.wishlistItem.delete({
          where: { id: item.id },
        });
      }
    }

    return movedCount;
  }
}
