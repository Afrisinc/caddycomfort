"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AddressService {
    /**
     * Get all addresses for a user
     */
    static async getUserAddresses(userId) {
        return prisma.address.findMany({
            where: { userId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ],
        });
    }
    /**
     * Get address by ID
     */
    static async getById(addressId, userId) {
        const address = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId,
            },
        });
        if (!address) {
            throw new Error('Address not found');
        }
        return address;
    }
    /**
     * Get default address for user
     */
    static async getDefaultAddress(userId) {
        return prisma.address.findFirst({
            where: {
                userId,
                isDefault: true,
            },
        });
    }
    /**
     * Create new address
     */
    static async create(userId, data) {
        // If this is set as default, unset other defaults
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        // If no addresses exist, make this one default
        const addressCount = await prisma.address.count({
            where: { userId },
        });
        const isDefault = data.isDefault || addressCount === 0;
        return prisma.address.create({
            data: {
                ...data,
                userId,
                isDefault,
            },
        });
    }
    /**
     * Update address
     */
    static async update(addressId, userId, data) {
        // Verify address exists and belongs to user
        await this.getById(addressId, userId);
        // If setting as default, unset other defaults
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId,
                    id: { not: addressId },
                },
                data: { isDefault: false },
            });
        }
        return prisma.address.update({
            where: { id: addressId },
            data,
        });
    }
    /**
     * Set address as default
     */
    static async setDefault(addressId, userId) {
        // Verify address exists and belongs to user
        await this.getById(addressId, userId);
        // Unset all other defaults
        await prisma.address.updateMany({
            where: {
                userId,
                id: { not: addressId },
            },
            data: { isDefault: false },
        });
        // Set this as default
        return prisma.address.update({
            where: { id: addressId },
            data: { isDefault: true },
        });
    }
    /**
     * Delete address
     */
    static async delete(addressId, userId) {
        // Verify address exists and belongs to user
        const address = await this.getById(addressId, userId);
        await prisma.address.delete({
            where: { id: addressId },
        });
        // If deleted address was default, set another as default
        if (address.isDefault) {
            const firstAddress = await prisma.address.findFirst({
                where: { userId },
                orderBy: { createdAt: 'asc' },
            });
            if (firstAddress) {
                await prisma.address.update({
                    where: { id: firstAddress.id },
                    data: { isDefault: true },
                });
            }
        }
    }
    /**
     * Count user addresses
     */
    static async count(userId) {
        return prisma.address.count({
            where: { userId },
        });
    }
}
exports.AddressService = AddressService;
