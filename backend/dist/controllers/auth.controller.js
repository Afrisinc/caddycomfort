"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.resetPassword = exports.forgotPassword = exports.resendVerification = exports.verifyEmail = exports.changePassword = exports.updateProfile = exports.getProfile = exports.logoutAll = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;
        // Validate required fields
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
            return;
        }
        // Validate password strength
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long',
            });
            return;
        }
        // Register user
        const result = await auth_service_1.AuthService.register({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            role: role,
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                res.status(409).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
        });
    }
};
exports.register = register;
/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }
        // Login user
        const result = await auth_service_1.AuthService.login(email.toLowerCase(), password);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
            if (error.message.includes('Invalid')) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to login',
        });
    }
};
exports.login = login;
/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token required',
            });
            return;
        }
        // Rotate refresh token
        const tokens = await auth_service_1.AuthService.rotateRefreshToken(refreshToken);
        res.status(200).json({
            success: true,
            message: 'Tokens refreshed successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        if (error instanceof Error) {
            res.status(401).json({
                success: false,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token',
        });
    }
};
exports.refresh = refresh;
/**
 * Logout user (revoke refresh token)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token required',
            });
            return;
        }
        // Revoke the refresh token
        await auth_service_1.AuthService.revokeToken(refreshToken);
        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout',
        });
    }
};
exports.logout = logout;
/**
 * Logout from all devices (revoke all refresh tokens)
 * POST /api/auth/logout-all
 */
const logoutAll = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        // Revoke all refresh tokens for the user
        await auth_service_1.AuthService.revokeAllUserTokens(req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Logged out from all devices successfully',
        });
    }
    catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout from all devices',
        });
    }
};
exports.logoutAll = logoutAll;
/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const user = await auth_service_1.AuthService.getUserById(req.user.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
        });
    }
};
exports.getProfile = getProfile;
/**
 * Update user profile
 * PATCH /api/auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const { firstName, lastName, phone, avatar } = req.body;
        const user = await auth_service_1.AuthService.updateProfile(req.user.userId, {
            firstName,
            lastName,
            phone,
            avatar,
        });
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user },
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
        });
    }
};
exports.updateProfile = updateProfile;
/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const { oldPassword, newPassword } = req.body;
        // Validate required fields
        if (!oldPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Old password and new password are required',
            });
            return;
        }
        // Validate new password strength
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long',
            });
            return;
        }
        await auth_service_1.AuthService.changePassword(req.user.userId, oldPassword, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please login again.',
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        if (error instanceof Error) {
            if (error.message.includes('Invalid old password')) {
                res.status(401).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
        });
    }
};
exports.changePassword = changePassword;
/**
 * Verify a user's email with the code sent to their inbox
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            res.status(400).json({
                success: false,
                message: 'Email and verification code are required',
            });
            return;
        }
        const user = await auth_service_1.AuthService.verifyEmail(email.toLowerCase(), code);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: { user },
        });
    }
    catch (error) {
        console.error('Verify email error:', error);
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error.message === 'Invalid verification code' ||
                error.message === 'Verification code has expired' ||
                error.message === 'No verification code found, please request a new one') {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to verify email',
        });
    }
};
exports.verifyEmail = verifyEmail;
/**
 * Resend the account verification code
 * POST /api/auth/resend-verification
 */
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }
        await auth_service_1.AuthService.resendVerificationCode(email.toLowerCase());
        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully',
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error.message === 'Account is already verified') {
                res.status(409).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code',
        });
    }
};
exports.resendVerification = resendVerification;
/**
 * Request a password reset email
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }
        await auth_service_1.AuthService.forgotPassword(email.toLowerCase());
        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent',
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
        });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Reset password using the token sent by email
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Token and new password are required',
            });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long',
            });
            return;
        }
        await auth_service_1.AuthService.resetPassword(token, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.',
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        if (error instanceof Error && error.message === 'Invalid or expired reset token') {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
        });
    }
};
exports.resetPassword = resetPassword;
/**
 * Verify token (for testing purposes)
 * GET /api/auth/verify
 */
const verifyToken = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                user: req.user,
            },
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};
exports.verifyToken = verifyToken;
