import { Request, Response } from 'express';
import { WishlistService } from '../services/wishlist.service';

export class WishlistController {
  /**
   * Get user's wishlist
   */
  static async getWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const wishlist = await WishlistService.getUserWishlist(userId);
      res.json({ success: true, data: wishlist });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching wishlist',
      });
    }
  }

  /**
   * Add product to wishlist
   */
  static async addToWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }

      const item = await WishlistService.addToWishlist(userId, productId);
      res.status(201).json({ success: true, message: 'Added to wishlist', data: item });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === 'Product already in wishlist') {
          return res.status(409).json({ success: false, message: error.message });
        }
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error adding to wishlist',
      });
    }
  }

  /**
   * Remove item from wishlist
   */
  static async removeFromWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await WishlistService.removeFromWishlist(userId, id);
      res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Wishlist item not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error removing from wishlist',
      });
    }
  }

  /**
   * Remove product from wishlist by product ID
   */
  static async removeByProductId(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      await WishlistService.removeByProductId(userId, productId);
      res.json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not in wishlist') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error removing from wishlist',
      });
    }
  }

  /**
   * Check if product is in wishlist
   */
  static async checkInWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      const inWishlist = await WishlistService.isInWishlist(userId, productId);
      res.json({ success: true, data: { inWishlist } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error checking wishlist',
      });
    }
  }

  /**
   * Clear wishlist
   */
  static async clearWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await WishlistService.clearWishlist(userId);
      res.json({ success: true, message: 'Wishlist cleared', data: { itemsRemoved: count } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error clearing wishlist',
      });
    }
  }

  /**
   * Get wishlist count
   */
  static async getCount(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await WishlistService.getCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error getting wishlist count',
      });
    }
  }

  /**
   * Move wishlist items to cart
   */
  static async moveToCart(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const movedCount = await WishlistService.moveToCart(userId);
      res.json({
        success: true,
        message: 'Items moved to cart',
        data: { movedCount },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error moving items to cart',
      });
    }
  }
}
