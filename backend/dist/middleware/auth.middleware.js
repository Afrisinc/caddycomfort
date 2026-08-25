"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireSuperAdmin = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const auth_service_1 = require("../services/auth.service");
const client_1 = require("@prisma/client");
/**
 * Middleware to verify JWT access token
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required',
            });
            return;
        }
        // Verify token
        const payload = auth_service_1.AuthService.verifyAccessToken(token);
        // Attach user info to request
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired access token',
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware to check if user has required role
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware to check if user is admin
 */
exports.requireAdmin = (0, exports.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN);
/**
 * Middleware to check if user is super admin
 */
exports.requireSuperAdmin = (0, exports.requireRole)(client_1.UserRole.SUPER_ADMIN);
/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const payload = auth_service_1.AuthService.verifyAccessToken(token);
            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            };
        }
    }
    catch (error) {
        // Token invalid or expired, but that's okay for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
