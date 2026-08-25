import { Notify } from '@afrisinc/notify-sdk';
import { logger } from '../../config/logger';

const apiKey = process.env.NOTIFY_API_KEY;

if (!apiKey) {
  logger.warn('NOTIFY_API_KEY is not set; notifications will not be sent');
}

export const notify = apiKey ? new Notify({ apiKey }) : null;
