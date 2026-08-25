"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
// Get own profile
router.get('/profile', auth_middleware_1.authenticateToken, user_controller_1.UserController.getProfile);
// Update own profile
router.put('/profile', auth_middleware_1.authenticateToken, user_controller_1.UserController.updateProfile);
// Change password
router.put('/change-password', auth_middleware_1.authenticateToken, user_controller_1.UserController.changePassword);
// Get own statistics
router.get('/stats', auth_middleware_1.authenticateToken, user_controller_1.UserController.getStats);
// Admin routes
// Get all users
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, user_controller_1.UserController.getAllUsers);
// Get user by ID
router.get('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, user_controller_1.UserController.getUserById);
// Update user role
router.patch('/:id/role', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, user_controller_1.UserController.updateUserRole);
// Delete user
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, user_controller_1.UserController.deleteUser);
exports.default = router;
