import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  /**
   * Get own profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await UserService.getProfile(userId);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching profile',
      });
    }
  }

  /**
   * Update own profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { firstName, lastName, name, phone, avatar } = req.body;

      const user = await UserService.updateProfile(userId, {
        firstName,
        lastName,
        name,
        phone,
        avatar,
      });

      res.json({ success: true, message: 'Profile updated successfully', data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating profile',
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
      }

      await UserService.changePassword(userId, {
        currentPassword,
        newPassword,
      });

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Current password is incorrect') {
          return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message === 'New password must be at least 6 characters') {
          return res.status(400).json({ success: false, message: error.message });
        }
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error changing password',
      });
    }
  }

  /**
   * Get own statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await UserService.getUserStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching statistics',
      });
    }
  }

  /**
   * Admin: Get all users
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { role, isVerified, search } = req.query;

      const filters: any = {};
      if (role) filters.role = role as string;
      if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
      if (search) filters.search = search as string;

      const users = await UserService.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Admin: Get user by ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      res.json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({
        message: 'Error fetching user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Admin: Update user role
   */
  static async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ message: 'Role is required' });
      }

      const user = await UserService.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid role' || error.message === 'User not found') {
          return res.status(400).json({ message: error.message });
        }
      }
      res.status(500).json({
        message: 'Error updating user role',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Admin: Delete user
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Cannot delete user with existing orders') {
          return res.status(400).json({ message: error.message });
        }
      }
      res.status(500).json({
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
