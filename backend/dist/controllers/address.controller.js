"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const address_service_1 = require("../services/address.service");
class AddressController {
    /**
     * Get all addresses for logged-in user
     */
    static async getAll(req, res) {
        try {
            const userId = req.user.userId;
            const addresses = await address_service_1.AddressService.getUserAddresses(userId);
            res.json(addresses);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching addresses',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get address by ID
     */
    static async getById(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const address = await address_service_1.AddressService.getById(id, userId);
            res.json(address);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Address not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error fetching address',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get default address
     */
    static async getDefault(req, res) {
        try {
            const userId = req.user.userId;
            const address = await address_service_1.AddressService.getDefaultAddress(userId);
            if (!address) {
                return res.status(404).json({ message: 'No default address found' });
            }
            res.json(address);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching default address',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Create new address
     */
    static async create(req, res) {
        try {
            const userId = req.user.userId;
            const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault, } = req.body;
            // Validation
            if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
                return res.status(400).json({
                    message: 'Required fields: fullName, phone, addressLine1, city, state, postalCode, country',
                });
            }
            const address = await address_service_1.AddressService.create(userId, {
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
            res.status(201).json(address);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error creating address',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Update address
     */
    static async update(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const updateData = req.body;
            const address = await address_service_1.AddressService.update(id, userId, updateData);
            res.json(address);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Address not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error updating address',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Set address as default
     */
    static async setDefault(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const address = await address_service_1.AddressService.setDefault(id, userId);
            res.json(address);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Address not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error setting default address',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Delete address
     */
    static async delete(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            await address_service_1.AddressService.delete(id, userId);
            res.json({ message: 'Address deleted successfully' });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Address not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Error deleting address',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.AddressController = AddressController;
