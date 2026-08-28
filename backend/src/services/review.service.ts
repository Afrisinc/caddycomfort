import { Review } from '@prisma/client';
import prisma from '../config/database';

interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

interface ReviewWithUser extends Review {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    avatar: string | null;
  };
}

interface ReviewFilters {
  productId?: string;
  userId?: string;
  rating?: number;
  isVerified?: boolean;
}

export class ReviewService {
  /**
   * Get all reviews with filters
   */
  static async getAll(filters?: ReviewFilters) {
    const { productId, userId, rating, isVerified } = filters || {};

    const where: any = {};
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;
    if (rating) where.rating = rating;
    if (isVerified !== undefined) where.isVerified = isVerified;

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
    }) as Promise<ReviewWithUser[]>;
  }

  /**
   * Get reviews for a product
   */
  static async getProductReviews(productId: string) {
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
  static async getProductReviewStats(productId: string) {
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

    const ratingDistribution = reviews.reduce(
      (acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
    );

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  }

  /**
   * Get review by ID
   */
  static async getById(reviewId: string): Promise<ReviewWithUser> {
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

    return review as ReviewWithUser;
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(userId: string) {
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
  static async create(
    userId: string,
    data: CreateReviewData
  ): Promise<Review> {
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
  static async update(
    reviewId: string,
    userId: string,
    data: UpdateReviewData
  ): Promise<Review> {
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
  static async delete(reviewId: string, userId: string): Promise<void> {
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
  static async adminDelete(reviewId: string): Promise<void> {
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
  static async verifyReview(reviewId: string, isVerified: boolean): Promise<Review> {
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
  static async canUserReview(userId: string, productId: string): Promise<boolean> {
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
