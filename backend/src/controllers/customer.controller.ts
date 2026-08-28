import { Request, Response } from 'express';
import { CustomerService, CustomerStatus } from '../services/customer.service';

const VALID_STATUSES: CustomerStatus[] = ['vip', 'active', 'inactive', 'suspended'];

export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;

    const statusFilter =
      typeof status === 'string' && VALID_STATUSES.includes(status as CustomerStatus)
        ? (status as CustomerStatus)
        : 'all';

    const customers = await CustomerService.getCustomers({
      search: typeof search === 'string' ? search : undefined,
      status: statusFilter,
    });

    res.json({ success: true, data: { customers } });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customers',
    });
  }
};

export const getCustomerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await CustomerService.getCustomerStats();
    res.json({ success: true, data: { stats } });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customer statistics',
    });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await CustomerService.getCustomerById(id);
    res.json({ success: true, data: { customer } });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Customer not found',
    });
  }
};

export const updateCustomerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isActive (boolean) is required',
      });
      return;
    }

    const customer = await CustomerService.setActiveStatus(id, isActive);
    res.json({
      success: true,
      message: isActive ? 'Customer account reactivated' : 'Customer account suspended',
      data: { customer },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update customer status',
    });
  }
};
