import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { credentialLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Protected routes (require authentication)
// Get own profile
router.get('/profile', authenticateToken, UserController.getProfile);

// Update own profile
router.put('/profile', authenticateToken, UserController.updateProfile);

// Change password
router.put('/change-password', authenticateToken, credentialLimiter, UserController.changePassword);

// Get own statistics
router.get('/stats', authenticateToken, UserController.getStats);

// Admin routes
// Get all users
router.get('/', authenticateToken, requireAdmin, UserController.getAllUsers);

// Get user by ID
router.get('/:id', authenticateToken, requireAdmin, UserController.getUserById);

// Update user role
router.patch('/:id/role', authenticateToken, requireAdmin, UserController.updateUserRole);

// Delete user
router.delete('/:id', authenticateToken, requireAdmin, UserController.deleteUser);

export default router;
