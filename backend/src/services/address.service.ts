import { Address } from '@prisma/client';
import prisma from '../config/database';

interface CreateAddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface UpdateAddressData {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export class AddressService {
  /**
   * Get all addresses for a user
   */
  static async getUserAddresses(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get address by ID
   */
  static async getById(addressId: string, userId: string): Promise<Address> {
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
  static async getDefaultAddress(userId: string): Promise<Address | null> {
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
  static async create(userId: string, data: CreateAddressData): Promise<Address> {
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
  static async update(
    addressId: string,
    userId: string,
    data: UpdateAddressData,
  ): Promise<Address> {
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
  static async setDefault(addressId: string, userId: string): Promise<Address> {
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
  static async delete(addressId: string, userId: string): Promise<void> {
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
  static async count(userId: string): Promise<number> {
    return prisma.address.count({
      where: { userId },
    });
  }
}
