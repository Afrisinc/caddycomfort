"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All cart routes require authentication
router.use(auth_middleware_1.authenticateToken);
// Get user's cart
router.get('/', cart_controller_1.CartController.getCart);
// Get cart item count
router.get('/count', cart_controller_1.CartController.getCartItemCount);
// Validate cart before checkout
router.get('/validate', cart_controller_1.CartController.validateCart);
// Add item to cart
router.post('/items', cart_controller_1.CartController.addItem);
// Update cart item quantity
router.patch('/items/:cartItemId', cart_controller_1.CartController.updateItemQuantity);
// Remove item from cart
router.delete('/items/:cartItemId', cart_controller_1.CartController.removeItem);
// Clear cart
router.delete('/clear', cart_controller_1.CartController.clearCart);
// Apply coupon
router.post('/coupon', cart_controller_1.CartController.applyCoupon);
// Remove coupon
router.delete('/coupon', cart_controller_1.CartController.removeCoupon);
// Merge guest cart with user cart
router.post('/merge', cart_controller_1.CartController.mergeGuestCart);
exports.default = router;
