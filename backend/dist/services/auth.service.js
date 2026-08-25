"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_notify_1 = require("../utils/notify/auth.notify");
const prisma = new client_1.PrismaClient();
const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
class AuthService {
    /**
     * Hash password using bcrypt
     */
    static async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    /**
     * Compare password with hashed password
     */
    static async comparePassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    /**
     * Generate access token
     */
    static generateAccessToken(payload) {
        const options = {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
        };
        return jsonwebtoken_1.default.sign(payload, this.ACCESS_TOKEN_SECRET, options);
    }
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload) {
        const options = {
            expiresIn: this.REFRESH_TOKEN_EXPIRY,
        };
        return jsonwebtoken_1.default.sign(payload, this.REFRESH_TOKEN_SECRET, options);
    }
    /**
     * Verify access token
     */
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.ACCESS_TOKEN_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    /**
     * Generate both access and refresh tokens
     */
    static async generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        // Calculate expiry date for refresh token
        const expiresAt = new Date();
        const expiryDays = this.REFRESH_TOKEN_EXPIRY.includes('d')
            ? parseInt(this.REFRESH_TOKEN_EXPIRY)
            : 7;
        expiresAt.setDate(expiresAt.getDate() + expiryDays);
        // Store refresh token in database
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    /**
     * Rotate refresh token (invalidate old, generate new)
     */
    static async rotateRefreshToken(oldToken) {
        // Verify the old refresh token
        const payload = this.verifyRefreshToken(oldToken);
        // Check if token exists and is not revoked
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: oldToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.isRevoked) {
            throw new Error('Invalid refresh token');
        }
        if (new Date() > storedToken.expiresAt) {
            throw new Error('Refresh token expired');
        }
        // Revoke old token
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        // Generate new tokens
        return this.generateTokens(storedToken.user);
    }
    /**
     * Revoke all refresh tokens for a user (logout from all devices)
     */
    static async revokeAllUserTokens(userId) {
        await prisma.refreshToken.updateMany({
            where: {
                userId,
                isRevoked: false,
            },
            data: {
                isRevoked: true,
            },
        });
    }
    /**
     * Revoke a specific refresh token
     */
    static async revokeToken(token) {
        await prisma.refreshToken.updateMany({
            where: { token },
            data: { isRevoked: true },
        });
    }
    /**
     * Clean up expired tokens (can be run as a cron job)
     */
    static async cleanupExpiredTokens() {
        await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { isRevoked: true },
                ],
            },
        });
    }
    /**
     * Register a new user
     */
    static async register(data) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await this.hashPassword(data.password);
        const verificationCode = this.generateVerificationCode();
        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role || client_1.UserRole.CUSTOMER,
                verificationCode,
                verificationCodeExpiry: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
            },
        });
        // Generate tokens
        const tokens = await this.generateTokens(user);
        await (0, auth_notify_1.sendVerificationEmail)(user, verificationCode);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, tokens };
    }
    /**
     * Generate a 6-digit numeric verification code
     */
    static generateVerificationCode() {
        return crypto_1.default.randomInt(100000, 1000000).toString();
    }
    /**
     * Verify a user's email using the code sent to their inbox
     */
    static async verifyEmail(email, code) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isVerified) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        if (!user.verificationCode || !user.verificationCodeExpiry) {
            throw new Error('No verification code found, please request a new one');
        }
        if (user.verificationCode !== code) {
            throw new Error('Invalid verification code');
        }
        if (new Date() > user.verificationCodeExpiry) {
            throw new Error('Verification code has expired');
        }
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null,
                verificationCodeExpiry: null,
            },
        });
        await (0, auth_notify_1.sendWelcomeEmail)(updatedUser);
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    /**
     * Resend the account verification code
     */
    static async resendVerificationCode(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isVerified) {
            throw new Error('Account is already verified');
        }
        const verificationCode = this.generateVerificationCode();
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode,
                verificationCodeExpiry: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
            },
        });
        await (0, auth_notify_1.sendVerificationEmail)(updatedUser, verificationCode);
    }
    /**
     * Start the forgot-password flow by emailing a reset token
     */
    static async forgotPassword(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpiry: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
            },
        });
        await (0, auth_notify_1.sendPasswordResetEmail)(updatedUser, resetToken);
    }
    /**
     * Complete the forgot-password flow using the emailed token
     */
    static async resetPassword(token, newPassword) {
        const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });
        if (!user || !user.passwordResetExpiry) {
            throw new Error('Invalid or expired reset token');
        }
        if (new Date() > user.passwordResetExpiry) {
            throw new Error('Invalid or expired reset token');
        }
        const hashedPassword = await this.hashPassword(newPassword);
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpiry: null,
            },
        });
        // Force re-login on all devices
        await this.revokeAllUserTokens(user.id);
        await (0, auth_notify_1.sendPasswordResetConfirmationEmail)(updatedUser);
    }
    /**
     * Login user
     */
    static async login(email, password) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Verify password
        const isValidPassword = await this.comparePassword(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        // Generate tokens
        const tokens = await this.generateTokens(user);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, tokens };
    }
    /**
     * Get user by ID
     */
    static async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return null;
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Update user profile
     */
    static async updateProfile(userId, data) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
        });
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Change password
     */
    static async changePassword(userId, oldPassword, newPassword) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Verify old password
        const isValidPassword = await this.comparePassword(oldPassword, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid old password');
        }
        // Hash new password
        const hashedPassword = await this.hashPassword(newPassword);
        // Update password
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        // Revoke all refresh tokens (force re-login on all devices)
        await this.revokeAllUserTokens(userId);
        await (0, auth_notify_1.sendPasswordChangedEmail)(updatedUser);
    }
}
exports.AuthService = AuthService;
AuthService.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key';
AuthService.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret';
AuthService.ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
AuthService.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
