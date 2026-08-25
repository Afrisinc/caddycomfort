"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const wishlist_service_1 = require("../services/wishlist.service");
class WishlistController {
    /**
     * Get user's wishlist
     */
    static async getWishlist(req, res) {
        try {
            const userId = req.user.userId;
            const wishlist = await wishlist_service_1.WishlistService.getUserWishlist(userId);
            res.json(wishlist);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching wishlist',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Add product to wishlist
     */
    static async addToWishlist(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.body;
            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }
            const item = await wishlist_service_1.WishlistService.addToWishlist(userId, productId);
            res.status(201).json(item);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Product not found') {
                    return res.status(404).json({ message: error.message });
                }
                if (error.message === 'Product already in wishlist') {
                    return res.status(409).json({ message: error.message });
                }
            }
            res.status(500).json({
                message: 'Error adding to wishlist',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Remove item from wishlist
     */
    static async removeFromWishlist(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            await wishlist_service_1.WishlistService.removeFromWishlist(userId, id);
            res.json({ message: 'Item removed from wishlist' });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Wishlist item not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error removing from wishlist',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Remove product from wishlist by product ID
     */
    static async removeByProductId(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;
            await wishlist_service_1.WishlistService.removeByProductId(userId, productId);
            res.json({ message: 'Product removed from wishlist' });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Product not in wishlist') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error removing from wishlist',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Check if product is in wishlist
     */
    static async checkInWishlist(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;
            const inWishlist = await wishlist_service_1.WishlistService.isInWishlist(userId, productId);
            res.json({ inWishlist });
        }
        catch (error) {
            res.status(500).json({
                message: 'Error checking wishlist',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Clear wishlist
     */
    static async clearWishlist(req, res) {
        try {
            const userId = req.user.userId;
            const count = await wishlist_service_1.WishlistService.clearWishlist(userId);
            res.json({ message: 'Wishlist cleared', itemsRemoved: count });
        }
        catch (error) {
            res.status(500).json({
                message: 'Error clearing wishlist',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get wishlist count
     */
    static async getCount(req, res) {
        try {
            const userId = req.user.userId;
            const count = await wishlist_service_1.WishlistService.getCount(userId);
            res.json({ count });
        }
        catch (error) {
            res.status(500).json({
                message: 'Error getting wishlist count',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Move wishlist items to cart
     */
    static async moveToCart(req, res) {
        try {
            const userId = req.user.userId;
            const movedCount = await wishlist_service_1.WishlistService.moveToCart(userId);
            res.json({
                message: 'Items moved to cart',
                movedCount,
            });
        }
        catch (error) {
            res.status(500).json({
                message: 'Error moving items to cart',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.WishlistController = WishlistController;
