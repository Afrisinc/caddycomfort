import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentClientError } from '../utils/payment/payment-client';

const handlePaymentError = (error: any, res: Response): void => {
  if (error instanceof PaymentClientError) {
    res.status(error.statusCode || 502).json({ success: false, message: error.message });
    return;
  }
  if (error.message === 'Order not found') {
    res.status(404).json({ success: false, message: error.message });
    return;
  }
  if (error.message === 'Unauthorized') {
    res.status(403).json({ success: false, message: error.message });
    return;
  }
  res.status(400).json({ success: false, message: error.message });
};

export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { orderId } = req.params;
    const { email, phoneNumber, customerName } = req.body;

    const result = await PaymentService.initiate(orderId, userId, {
      email,
      phoneNumber,
      customerName,
    });

    res.json({ success: true, message: result.message, data: result });
  } catch (error: any) {
    handlePaymentError(error, res);
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { orderId } = req.params;

    const result = await PaymentService.getStatus(orderId, userId);

    res.json({ success: true, data: result });
  } catch (error: any) {
    handlePaymentError(error, res);
  }
};
