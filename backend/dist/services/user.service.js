"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_notify_1 = require("../utils/notify/auth.notify");
const prisma = new client_1.PrismaClient();
class UserService {
    /**
     * Get user profile
     */
    static async getProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    /**
     * Update user profile
     */
    static async updateProfile(userId, data) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    /**
     * Change password
     */
    static async changePassword(userId, data) {
        const { currentPassword, newPassword } = data;
        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }
        // Validate new password
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        // Revoke all refresh tokens for security
        await prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
        await (0, auth_notify_1.sendPasswordChangedEmail)(updatedUser);
    }
    /**
     * Get user statistics
     */
    static async getUserStats(userId) {
        const [totalOrders, pendingOrders, completedOrders, totalSpent, reviewCount, wishlistCount, addressCount,] = await Promise.all([
            prisma.order.count({ where: { userId } }),
            prisma.order.count({ where: { userId, status: 'PENDING' } }),
            prisma.order.count({ where: { userId, status: 'DELIVERED' } }),
            prisma.order.aggregate({
                where: { userId, status: 'DELIVERED' },
                _sum: { total: true },
            }),
            prisma.review.count({ where: { userId } }),
            prisma.wishlistItem.count({ where: { userId } }),
            prisma.address.count({ where: { userId } }),
        ]);
        return {
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
            },
            totalSpent: totalSpent._sum.total || 0,
            reviewCount,
            wishlistCount,
            addressCount,
        };
    }
    /**
     * Admin: Get all users
     */
    static async getAllUsers(filters) {
        const { role, isVerified, search } = filters || {};
        const where = {};
        if (role)
            where.role = role;
        if (isVerified !== undefined)
            where.isVerified = isVerified;
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        return prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                        addresses: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Admin: Get user by ID with details
     */
    static async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                addresses: true,
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                        wishlist: true,
                    },
                },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    /**
     * Admin: Update user role
     */
    static async updateUserRole(userId, role) {
        const validRoles = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role');
        }
        return prisma.user.update({
            where: { id: userId },
            data: { role: role },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
    }
    /**
     * Admin: Delete user
     */
    static async deleteUser(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Check if user has any orders
        const orderCount = await prisma.order.count({
            where: { userId },
        });
        if (orderCount > 0) {
            throw new Error('Cannot delete user with existing orders');
        }
        await prisma.user.delete({
            where: { id: userId },
        });
    }
}
exports.UserService = UserService;
