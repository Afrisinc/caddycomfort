"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Public routes (no authentication required)
 */
// Register a new user
router.post('/register', authController.register);
// Login user
router.post('/login', authController.login);
// Refresh access token
router.post('/refresh', authController.refresh);
// Logout user (revoke refresh token)
router.post('/logout', authController.logout);
// Verify account email using the code sent at registration
router.post('/verify-email', authController.verifyEmail);
// Resend account verification code
router.post('/resend-verification', authController.resendVerification);
// Request a password reset email
router.post('/forgot-password', authController.forgotPassword);
// Reset password using the token sent by email
router.post('/reset-password', authController.resetPassword);
/**
 * Protected routes (authentication required)
 */
// Get current user profile
router.get('/me', auth_middleware_1.authenticateToken, authController.getProfile);
// Update user profile
router.patch('/profile', auth_middleware_1.authenticateToken, authController.updateProfile);
// Change password
router.post('/change-password', auth_middleware_1.authenticateToken, authController.changePassword);
// Logout from all devices
router.post('/logout-all', auth_middleware_1.authenticateToken, authController.logoutAll);
// Verify token (for testing)
router.get('/verify', auth_middleware_1.authenticateToken, authController.verifyToken);
exports.default = router;
