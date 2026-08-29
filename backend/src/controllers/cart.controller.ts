import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
  /**
   * Get user's cart
   */
  static async getCart(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const cart = await CartService.getOrCreateCart(userId);
      res.json({ success: true, data: { cart } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Add item to cart
   */
  static async addItem(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId, quantity, size, color } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
      }

      if (quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
      }

      const cart = await CartService.addItem(userId, productId, quantity, size, color);
      res.status(201).json({ success: true, data: { cart } });
    } catch (error: any) {
      if (
        error.message.includes('not found') ||
        error.message.includes('not available')
      ) {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Insufficient stock')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateItemQuantity(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { cartItemId } = req.params;
      const { quantity } = req.body;

      if (!quantity) {
        return res.status(400).json({ success: false, message: 'Quantity is required' });
      }

      if (quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
      }

      const cart = await CartService.updateItemQuantity(userId, cartItemId, quantity);
      res.json({ success: true, data: { cart } });
    } catch (error: any) {
      if (error.message === 'Cart item not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error.message.includes('Insufficient stock')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { cartItemId } = req.params;

      const cart = await CartService.removeItem(userId, cartItemId);
      res.json({ success: true, data: { cart } });
    } catch (error: any) {
      if (error.message === 'Cart item not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Clear cart
   */
  static async clearCart(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await CartService.clearCart(userId);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Apply coupon to cart
   */
  static async applyCoupon(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { couponCode } = req.body;

      if (!couponCode) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
      }

      const cart = await CartService.applyCoupon(userId, couponCode);
      res.json({ success: true, data: { cart } });
    } catch (error: any) {
      if (
        error.message.includes('Invalid') ||
        error.message.includes('not active') ||
        error.message.includes('expired') ||
        error.message.includes('not yet valid') ||
        error.message.includes('limit reached') ||
        error.message.includes('already used') ||
        error.message.includes('Minimum purchase')
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Remove coupon from cart
   */
  static async removeCoupon(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const cart = await CartService.removeCoupon(userId);
      res.json({ success: true, data: { cart } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Validate cart before checkout
   */
  static async validateCart(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const validation = await CartService.validateCart(userId);
      res.json({ success: true, data: validation });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get cart item count
   */
  static async getCartItemCount(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await CartService.getCartItemCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Merge guest cart with user cart
   */
  static async mergeGuestCart(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Items array is required' });
      }

      const cart = await CartService.mergeGuestCart(userId, items);
      res.json({ success: true, data: { cart } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
