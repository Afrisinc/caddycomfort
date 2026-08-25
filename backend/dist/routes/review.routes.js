"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
// Get product reviews with stats
router.get('/products/:productId', review_controller_1.ReviewController.getProductReviews);
// Get review by ID
router.get('/:id', review_controller_1.ReviewController.getById);
// Protected routes (require authentication)
// Get user's own reviews
router.get('/user/me', auth_middleware_1.authenticateToken, review_controller_1.ReviewController.getUserReviews);
// Check if user can review a product
router.get('/can-review/:productId', auth_middleware_1.authenticateToken, review_controller_1.ReviewController.canReview);
// Create review
router.post('/', auth_middleware_1.authenticateToken, review_controller_1.ReviewController.create);
// Update own review
router.put('/:id', auth_middleware_1.authenticateToken, review_controller_1.ReviewController.update);
// Delete own review
router.delete('/:id', auth_middleware_1.authenticateToken, review_controller_1.ReviewController.delete);
// Admin routes
// Get all reviews with filters
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, review_controller_1.ReviewController.getAll);
// Delete any review
router.delete('/admin/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, review_controller_1.ReviewController.adminDelete);
// Verify/unverify review
router.patch('/:id/verify', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, review_controller_1.ReviewController.verifyReview);
exports.default = router;
