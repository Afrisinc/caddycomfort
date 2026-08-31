import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export interface CartItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartWithDetails {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      salePrice: number | null;
      imageUrl: string | null;
      stockQuantity: number;
      isActive: boolean;
    };
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  coupon: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CartService {
  /**
   * Get or create cart for user
   */
  static async getOrCreateCart(userId: string): Promise<CartWithDetails> {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                imageUrl: true,
                stockQuantity: true,
                isActive: true,
              },
            },
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  salePrice: true,
                  imageUrl: true,
                  stockQuantity: true,
                  isActive: true,
                },
              },
            },
          },
          coupon: {
            select: {
              id: true,
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
      });
    }

    return this.calculateCartTotals(cart);
  }

  /**
   * Add item to cart
   */
  static async addItem(
    userId: string,
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ): Promise<CartWithDetails> {
    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.isActive) {
      throw new Error('Product is not available');
    }

    if (product.stockQuantity < quantity) {
      throw new Error(`Insufficient stock. Only ${product.stockQuantity} available`);
    }

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId === productId &&
        item.size === (size ?? null) &&
        item.color === (color ?? null),
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.stockQuantity < newQuantity) {
        throw new Error(
          `Cannot add ${quantity} more. Only ${
            product.stockQuantity - existingItem.quantity
          } additional items available`,
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          userId,
          productId,
          quantity,
          size,
          color,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  /**
   * Update cart item quantity
   */
  static async updateItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartWithDetails> {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || !cartItem.cart) {
      throw new Error('Cart item not found');
    }

    if (cartItem.cart.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (cartItem.product.stockQuantity < quantity) {
      throw new Error(`Insufficient stock. Only ${cartItem.product.stockQuantity} available`);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getOrCreateCart(userId);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: string, cartItemId: string): Promise<CartWithDetails> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || !cartItem.cart) {
      throw new Error('Cart item not found');
    }

    if (cartItem.cart.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getOrCreateCart(userId);
  }

  /**
   * Clear cart
   */
  static async clearCart(userId: string): Promise<{ message: string }> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Remove coupon if applied
      await prisma.cart.update({
        where: { id: cart.id },
        data: { couponId: null },
      });
    }

    return { message: 'Cart cleared successfully' };
  }

  /**
   * Apply coupon to cart
   */
  static async applyCoupon(userId: string, couponCode: string): Promise<CartWithDetails> {
    const cart = await this.getOrCreateCart(userId);

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw new Error('Coupon is not active');
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new Error('Coupon is not yet valid');
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      throw new Error('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }

    if (coupon.minPurchaseAmount && cart.subtotal < coupon.minPurchaseAmount) {
      throw new Error(`Minimum purchase amount of $${coupon.minPurchaseAmount} required`);
    }

    // Check if user has already used this coupon
    if (coupon.perUserLimit) {
      const userUsage = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userUsage >= coupon.perUserLimit) {
        throw new Error('You have already used this coupon the maximum number of times');
      }
    }

    // Apply coupon
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: coupon.id },
    });

    return this.getOrCreateCart(userId);
  }

  /**
   * Remove coupon from cart
   */
  static async removeCoupon(userId: string): Promise<CartWithDetails> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { couponId: null },
      });
    }

    return this.getOrCreateCart(userId);
  }

  /**
   * Validate cart before checkout
   */
  static async validateCart(userId: string): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const cart = await this.getOrCreateCart(userId);
    const errors: string[] = [];

    if (cart.items.length === 0) {
      errors.push('Cart is empty');
      return { valid: false, errors };
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        errors.push(`${item.product.name} is no longer available`);
      }

      if (item.product.stockQuantity < item.quantity) {
        errors.push(
          `${item.product.name}: Only ${item.product.stockQuantity} available, but ${item.quantity} in cart`,
        );
      }
    }

    // Validate coupon if applied
    if (cart.coupon) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: cart.coupon.id },
      });

      if (!coupon || !coupon.isActive) {
        errors.push('Applied coupon is no longer valid');
      } else {
        const now = new Date();
        if (coupon.validFrom && coupon.validFrom > now) {
          errors.push('Coupon is not yet valid');
        }
        if (coupon.validUntil && coupon.validUntil < now) {
          errors.push('Coupon has expired');
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          errors.push('Coupon usage limit reached');
        }
        if (coupon.minPurchaseAmount && cart.subtotal < coupon.minPurchaseAmount) {
          errors.push(
            `Minimum purchase amount of $${coupon.minPurchaseAmount} required for coupon`,
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get cart item count
   */
  static async getCartItemCount(userId: string): Promise<number> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      return 0;
    }

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calculate cart totals
   */
  private static calculateCartTotals(cart: any): CartWithDetails {
    let subtotal = 0;
    const items = cart.items.map((item: any) => {
      const price = item.product.salePrice || item.product.price;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      return {
        ...item,
        subtotal: itemSubtotal,
      };
    });

    let discount = 0;
    if (cart.coupon) {
      if (cart.coupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * cart.coupon.discountValue) / 100;
      } else if (cart.coupon.discountType === 'FIXED_AMOUNT') {
        discount = cart.coupon.discountValue;
      }
      // FREE_SHIPPING doesn't affect cart total here
    }

    const total = Math.max(0, subtotal - discount);

    return {
      ...cart,
      items,
      subtotal,
      discount,
      total,
    };
  }

  /**
   * Merge guest cart with user cart after login
   */
  static async mergeGuestCart(
    userId: string,
    guestCartItems: CartItemInput[],
  ): Promise<CartWithDetails> {
    for (const item of guestCartItems) {
      try {
        await this.addItem(userId, item.productId, item.quantity, item.size, item.color);
      } catch (error) {
        // Continue with other items if one fails
        console.error(`Failed to add item ${item.productId}:`, error);
      }
    }

    return this.getOrCreateCart(userId);
  }
}
