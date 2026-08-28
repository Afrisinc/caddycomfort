import { Request, Response } from 'express';
import { AddressService } from '../services/address.service';

export class AddressController {
  /**
   * Get all addresses for logged-in user
   */
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const addresses = await AddressService.getUserAddresses(userId);
      res.json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching addresses',
      });
    }
  }

  /**
   * Get address by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const address = await AddressService.getById(id, userId);
      res.json({ success: true, data: address });
    } catch (error) {
      if (error instanceof Error && error.message === 'Address not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching address',
      });
    }
  }

  /**
   * Get default address
   */
  static async getDefault(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const address = await AddressService.getDefaultAddress(userId);

      if (!address) {
        return res.status(404).json({ success: false, message: 'No default address found' });
      }

      res.json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching default address',
      });
    }
  }

  /**
   * Create new address
   */
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
      } = req.body;

      // Validation
      if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: fullName, phone, addressLine1, city, state, postalCode, country',
        });
      }

      const address = await AddressService.create(userId, {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
      });

      res.status(201).json({ success: true, message: 'Address created successfully', data: address });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error creating address',
      });
    }
  }

  /**
   * Update address
   */
  static async update(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const updateData = req.body;

      const address = await AddressService.update(id, userId, updateData);
      res.json({ success: true, message: 'Address updated successfully', data: address });
    } catch (error) {
      if (error instanceof Error && error.message === 'Address not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating address',
      });
    }
  }

  /**
   * Set address as default
   */
  static async setDefault(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const address = await AddressService.setDefault(id, userId);
      res.json({ success: true, message: 'Default address updated', data: address });
    } catch (error) {
      if (error instanceof Error && error.message === 'Address not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error setting default address',
      });
    }
  }

  /**
   * Delete address
   */
  static async delete(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await AddressService.delete(id, userId);
      res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Address not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting address',
      });
    }
  }
}
