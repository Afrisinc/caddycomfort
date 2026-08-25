"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
class ReviewController {
    /**
     * Get all reviews (with filters)
     */
    static async getAll(req, res) {
        try {
            const { productId, userId, rating, isVerified } = req.query;
            const filters = {};
            if (productId)
                filters.productId = productId;
            if (userId)
                filters.userId = userId;
            if (rating)
                filters.rating = parseInt(rating);
            if (isVerified !== undefined)
                filters.isVerified = isVerified === 'true';
            const reviews = await review_service_1.ReviewService.getAll(filters);
            res.json(reviews);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching reviews',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get product reviews with statistics
     */
    static async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const result = await review_service_1.ReviewService.getProductReviews(productId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching product reviews',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get review by ID
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const review = await review_service_1.ReviewService.getById(id);
            res.json(review);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Review not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error fetching review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get user's own reviews
     */
    static async getUserReviews(req, res) {
        try {
            const userId = req.user.userId;
            const reviews = await review_service_1.ReviewService.getUserReviews(userId);
            res.json(reviews);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching user reviews',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Create review
     */
    static async create(req, res) {
        try {
            const userId = req.user.userId;
            const { productId, rating, title, comment, images } = req.body;
            if (!productId || !rating || !comment) {
                return res.status(400).json({
                    message: 'Required fields: productId, rating, comment',
                });
            }
            const review = await review_service_1.ReviewService.create(userId, {
                productId,
                rating,
                title,
                comment,
                images,
            });
            res.status(201).json(review);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Product not found') {
                    return res.status(404).json({ message: error.message });
                }
                if (error.message === 'You have already reviewed this product') {
                    return res.status(409).json({ message: error.message });
                }
                if (error.message === 'Rating must be between 1 and 5') {
                    return res.status(400).json({ message: error.message });
                }
            }
            res.status(500).json({
                message: 'Error creating review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Update review
     */
    static async update(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const updateData = req.body;
            const review = await review_service_1.ReviewService.update(id, userId, updateData);
            res.json(review);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Review not found') {
                    return res.status(404).json({ message: error.message });
                }
                if (error.message === 'Rating must be between 1 and 5') {
                    return res.status(400).json({ message: error.message });
                }
            }
            res.status(500).json({
                message: 'Error updating review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Delete review
     */
    static async delete(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            await review_service_1.ReviewService.delete(id, userId);
            res.json({ message: 'Review deleted successfully' });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Review not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error deleting review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Check if user can review product
     */
    static async canReview(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;
            const canReview = await review_service_1.ReviewService.canUserReview(userId, productId);
            res.json({ canReview });
        }
        catch (error) {
            res.status(500).json({
                message: 'Error checking review eligibility',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Admin: Delete any review
     */
    static async adminDelete(req, res) {
        try {
            const { id } = req.params;
            await review_service_1.ReviewService.adminDelete(id);
            res.json({ message: 'Review deleted successfully' });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Review not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error deleting review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Admin: Verify review
     */
    static async verifyReview(req, res) {
        try {
            const { id } = req.params;
            const { isVerified } = req.body;
            if (typeof isVerified !== 'boolean') {
                return res.status(400).json({ message: 'isVerified must be a boolean' });
            }
            const review = await review_service_1.ReviewService.verifyReview(id, isVerified);
            res.json(review);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Review not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error verifying review',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.ReviewController = ReviewController;
