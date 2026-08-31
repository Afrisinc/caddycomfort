import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';
import prisma from '../config/database';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
} from '../utils/notify/auth.notify';

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type PublicUser = Omit<
  User,
  | 'password'
  | 'verificationCode'
  | 'verificationCodeExpiry'
  | 'passwordResetToken'
  | 'passwordResetExpiry'
>;

const toPublicUser = (user: User): PublicUser => {
  const {
    password: _password,
    verificationCode: _verificationCode,
    verificationCodeExpiry: _verificationCodeExpiry,
    passwordResetToken: _passwordResetToken,
    passwordResetExpiry: _passwordResetExpiry,
    ...publicUser
  } = user;
  return publicUser;
};

export class AuthService {
  private static readonly ACCESS_TOKEN_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly REFRESH_TOKEN_SECRET: string =
    process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret';
  private static readonly ACCESS_TOKEN_EXPIRY: string = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly REFRESH_TOKEN_EXPIRY: string =
    process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hashed password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.ACCESS_TOKEN_EXPIRY as any,
    };
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, options);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.REFRESH_TOKEN_EXPIRY as any,
    };
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static async generateTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
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
  static async rotateRefreshToken(oldToken: string): Promise<AuthTokens> {
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

    if (!storedToken.user.isActive) {
      throw new Error('Your account has been suspended. Please contact support.');
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
  static async revokeAllUserTokens(userId: string): Promise<void> {
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
  static async revokeToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Clean up expired tokens (can be run as a cron job)
   */
  static async cleanupExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
  }

  /**
   * Register a new user
   */
  static async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
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
        role: data.role || UserRole.CUSTOMER,
        verificationCode,
        verificationCodeExpiry: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    await sendVerificationEmail(user, verificationCode);

    // Remove password from response
    const userWithoutPassword = toPublicUser(user);

    return { user: userWithoutPassword, tokens };
  }

  /**
   * Generate a 6-digit numeric verification code
   */
  static generateVerificationCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Verify a user's email using the code sent to their inbox
   */
  static async verifyEmail(email: string, code: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      const userWithoutPassword = toPublicUser(user);
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

    await sendWelcomeEmail(updatedUser);

    const userWithoutPassword = toPublicUser(updatedUser);
    return userWithoutPassword;
  }

  /**
   * Resend the account verification code
   */
  static async resendVerificationCode(email: string): Promise<void> {
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

    await sendVerificationEmail(updatedUser, verificationCode);
  }

  /**
   * Start the forgot-password flow by emailing a reset token
   */
  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    await sendPasswordResetEmail(updatedUser, resetToken);
  }

  /**
   * Complete the forgot-password flow using the emailed token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });

    if (!user?.passwordResetExpiry) {
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

    await sendPasswordResetConfirmationEmail(updatedUser);
  }

  /**
   * Login user
   */
  static async login(
    email: string,
    password: string,
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
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

    if (!user.isActive) {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove password from response
    const userWithoutPassword = toPublicUser(user);

    return { user: userWithoutPassword, tokens };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<PublicUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const userWithoutPassword = toPublicUser(user);
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
    },
  ): Promise<PublicUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const userWithoutPassword = toPublicUser(user);
    return userWithoutPassword;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
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

    await sendPasswordChangedEmail(updatedUser);
  }
}
