"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ReviewService {
    /**
     * Get all reviews with filters
     */
    static async getAll(filters) {
        const { productId, userId, rating, isVerified } = filters || {};
        const where = {};
        if (productId)
            where.productId = productId;
        if (userId)
            where.userId = userId;
        if (rating)
            where.rating = rating;
        if (isVerified !== undefined)
            where.isVerified = isVerified;
        return prisma.review.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get reviews for a product
     */
    static async getProductReviews(productId) {
        const reviews = await this.getAll({ productId });
        // Calculate statistics
        const stats = await this.getProductReviewStats(productId);
        return {
            reviews,
            stats,
        };
    }
    /**
     * Get product review statistics
     */
    static async getProductReviewStats(productId) {
        const reviews = await prisma.review.findMany({
            where: { productId },
            select: { rating: true },
        });
        const totalReviews = reviews.length;
        if (totalReviews === 0) {
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            };
        }
        const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = sumRating / totalReviews;
        const ratingDistribution = reviews.reduce((acc, r) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1;
            return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        return {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
        };
    }
    /**
     * Get review by ID
     */
    static async getById(reviewId) {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        if (!review) {
            throw new Error('Review not found');
        }
        return review;
    }
    /**
     * Get user's reviews
     */
    static async getUserReviews(userId) {
        return prisma.review.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        imageUrl: true,
                        images: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Create review
     */
    static async create(userId, data) {
        const { productId, rating, title, comment, images } = data;
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (existingReview) {
            throw new Error('You have already reviewed this product');
        }
        // Check if user has purchased this product (for verified review)
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                    status: 'DELIVERED',
                },
            },
        });
        return prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                title,
                comment,
                images: images || [],
                isVerified: !!hasPurchased,
            },
        });
    }
    /**
     * Update review
     */
    static async update(reviewId, userId, data) {
        // Verify review exists and belongs to user
        const review = await prisma.review.findFirst({
            where: {
                id: reviewId,
                userId,
            },
        });
        if (!review) {
            throw new Error('Review not found');
        }
        // Validate rating if provided
        if (data.rating && (data.rating < 1 || data.rating > 5)) {
            throw new Error('Rating must be between 1 and 5');
        }
        return prisma.review.update({
            where: { id: reviewId },
            data,
        });
    }
    /**
     * Delete review
     */
    static async delete(reviewId, userId) {
        const review = await prisma.review.findFirst({
            where: {
                id: reviewId,
                userId,
            },
        });
        if (!review) {
            throw new Error('Review not found');
        }
        await prisma.review.delete({
            where: { id: reviewId },
        });
    }
    /**
     * Admin: Delete any review
     */
    static async adminDelete(reviewId) {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new Error('Review not found');
        }
        await prisma.review.delete({
            where: { id: reviewId },
        });
    }
    /**
     * Admin: Verify review
     */
    static async verifyReview(reviewId, isVerified) {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new Error('Review not found');
        }
        return prisma.review.update({
            where: { id: reviewId },
            data: { isVerified },
        });
    }
    /**
     * Check if user can review product
     */
    static async canUserReview(userId, productId) {
        // Check if already reviewed
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (existingReview) {
            return false;
        }
        // Check if user has purchased this product
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                    status: 'DELIVERED',
                },
            },
        });
        return !!hasPurchased;
    }
}
exports.ReviewService = ReviewService;
