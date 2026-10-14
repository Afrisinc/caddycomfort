import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { credentialLimiter, emailLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// Register a new user
router.post('/register', emailLimiter, authController.register);

// Login user
router.post('/login', credentialLimiter, authController.login);

// Refresh access token
router.post('/refresh', authController.refresh);

// Logout user (revoke refresh token)
router.post('/logout', authController.logout);

// Verify account email using the code sent at registration
router.post('/verify-email', credentialLimiter, authController.verifyEmail);

// Resend account verification code
router.post('/resend-verification', emailLimiter, authController.resendVerification);

// Request a password reset email
router.post('/forgot-password', emailLimiter, authController.forgotPassword);

// Reset password using the token sent by email
router.post('/reset-password', credentialLimiter, authController.resetPassword);

/**
 * Protected routes (authentication required)
 */

// Get current user profile
router.get('/me', authenticateToken, authController.getProfile);

// Update user profile
router.patch('/profile', authenticateToken, authController.updateProfile);

// Change password
router.post(
  '/change-password',
  authenticateToken,
  credentialLimiter,
  authController.changePassword,
);

// Logout from all devices
router.post('/logout-all', authenticateToken, authController.logoutAll);

// Verify token (for testing)
router.get('/verify', authenticateToken, authController.verifyToken);

export default router;
