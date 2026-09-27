import { Request, Response } from 'express';
import { SettingsService, SettingsValidationError } from '../services/settings.service';
import { logger } from '../config/logger';

export class SettingsController {
  static async get(_req: Request, res: Response) {
    try {
      const settings = await SettingsService.get();
      res.json({ success: true, data: settings });
    } catch (error) {
      logger.error({ err: error }, 'Failed to load settings');
      res.status(500).json({ success: false, message: 'Failed to load settings' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const settings = await SettingsService.update(req.body ?? {});
      res.json({ success: true, message: 'Settings saved', data: settings });
    } catch (error) {
      if (error instanceof SettingsValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      logger.error({ err: error }, 'Failed to save settings');
      res.status(500).json({ success: false, message: 'Failed to save settings' });
    }
  }
}
