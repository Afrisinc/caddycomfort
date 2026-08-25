"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_service_1 = require("../services/cart.service");
class CartController {
    /**
     * Get user's cart
     */
    static async getCart(req, res) {
        try {
            const userId = req.user.userId;
            const cart = await cart_service_1.CartService.getOrCreateCart(userId);
            res.json(cart);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Add item to cart
     */
    static async addItem(req, res) {
        try {
            const userId = req.user.userId;
            const { productId, quantity } = req.body;
            if (!productId || !quantity) {
                return res.status(400).json({ error: 'Product ID and quantity are required' });
            }
            if (quantity < 1) {
                return res.status(400).json({ error: 'Quantity must be at least 1' });
            }
            const cart = await cart_service_1.CartService.addItem(userId, productId, quantity);
            res.status(201).json(cart);
        }
        catch (error) {
            if (error.message.includes('not found') ||
                error.message.includes('not available')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Insufficient stock')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Update cart item quantity
     */
    static async updateItemQuantity(req, res) {
        try {
            const userId = req.user.userId;
            const { cartItemId } = req.params;
            const { quantity } = req.body;
            if (!quantity) {
                return res.status(400).json({ error: 'Quantity is required' });
            }
            if (quantity < 1) {
                return res.status(400).json({ error: 'Quantity must be at least 1' });
            }
            const cart = await cart_service_1.CartService.updateItemQuantity(userId, cartItemId, quantity);
            res.json(cart);
        }
        catch (error) {
            if (error.message === 'Cart item not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Unauthorized') {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.includes('Insufficient stock')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Remove item from cart
     */
    static async removeItem(req, res) {
        try {
            const userId = req.user.userId;
            const { cartItemId } = req.params;
            const cart = await cart_service_1.CartService.removeItem(userId, cartItemId);
            res.json(cart);
        }
        catch (error) {
            if (error.message === 'Cart item not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Unauthorized') {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Clear cart
     */
    static async clearCart(req, res) {
        try {
            const userId = req.user.userId;
            const result = await cart_service_1.CartService.clearCart(userId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Apply coupon to cart
     */
    static async applyCoupon(req, res) {
        try {
            const userId = req.user.userId;
            const { couponCode } = req.body;
            if (!couponCode) {
                return res.status(400).json({ error: 'Coupon code is required' });
            }
            const cart = await cart_service_1.CartService.applyCoupon(userId, couponCode);
            res.json(cart);
        }
        catch (error) {
            if (error.message.includes('Invalid') ||
                error.message.includes('not active') ||
                error.message.includes('expired') ||
                error.message.includes('not yet valid') ||
                error.message.includes('limit reached') ||
                error.message.includes('already used') ||
                error.message.includes('Minimum purchase')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Remove coupon from cart
     */
    static async removeCoupon(req, res) {
        try {
            const userId = req.user.userId;
            const cart = await cart_service_1.CartService.removeCoupon(userId);
            res.json(cart);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Validate cart before checkout
     */
    static async validateCart(req, res) {
        try {
            const userId = req.user.userId;
            const validation = await cart_service_1.CartService.validateCart(userId);
            res.json(validation);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get cart item count
     */
    static async getCartItemCount(req, res) {
        try {
            const userId = req.user.userId;
            const count = await cart_service_1.CartService.getCartItemCount(userId);
            res.json({ count });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Merge guest cart with user cart
     */
    static async mergeGuestCart(req, res) {
        try {
            const userId = req.user.userId;
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ error: 'Items array is required' });
            }
            const cart = await cart_service_1.CartService.mergeGuestCart(userId, items);
            res.json(cart);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.CartController = CartController;
