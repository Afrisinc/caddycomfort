import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, company, subject, message } = req.body;

    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'A valid email is required' });
      return;
    }

    if (!subject || !message) {
      res.status(400).json({ success: false, message: 'Subject and message are required' });
      return;
    }

    const contact = await ContactService.submitContactForm({
      email,
      firstName,
      lastName,
      company,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent',
      data: { id: contact.id, subscribed: contact.subscribed },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit contact form',
    });
  }
};

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'A valid email is required' });
      return;
    }

    const contact = await ContactService.subscribeNewsletter(email);

    res.status(201).json({
      success: true,
      message: 'Subscribed to newsletter',
      data: { id: contact.id, subscribed: contact.subscribed },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to subscribe to newsletter',
    });
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'A valid email is required' });
      return;
    }

    const contact = await ContactService.unsubscribeNewsletter(email);

    res.json({
      success: true,
      message: 'Unsubscribed from newsletter',
      data: { id: contact.id, subscribed: contact.subscribed },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unsubscribe from newsletter',
    });
  }
};
