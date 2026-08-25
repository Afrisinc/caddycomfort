"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = require("../controllers/wishlist.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
// Get wishlist
router.get('/', wishlist_controller_1.WishlistController.getWishlist);
// Get wishlist count
router.get('/count', wishlist_controller_1.WishlistController.getCount);
// Check if product is in wishlist
router.get('/check/:productId', wishlist_controller_1.WishlistController.checkInWishlist);
// Add to wishlist
router.post('/', wishlist_controller_1.WishlistController.addToWishlist);
// Move all items to cart
router.post('/move-to-cart', wishlist_controller_1.WishlistController.moveToCart);
// Remove from wishlist by item ID
router.delete('/:id', wishlist_controller_1.WishlistController.removeFromWishlist);
// Remove from wishlist by product ID
router.delete('/product/:productId', wishlist_controller_1.WishlistController.removeByProductId);
// Clear wishlist
router.delete('/', wishlist_controller_1.WishlistController.clearWishlist);
exports.default = router;
