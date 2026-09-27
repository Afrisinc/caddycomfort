import { CronJob } from 'cron';
import { logger } from '../config/logger';
import { LoginAttemptService, RETENTION_DAYS } from '../services/login-attempt.service';

const CRON_SCHEDULE = '0 30 3 * * *';

let job: CronJob | null = null;

export function initializeLoginAttemptCleanupJob(): void {
  job = new CronJob(
    CRON_SCHEDULE,
    () => {
      LoginAttemptService.prune()
        .then((removed) => {
          if (removed > 0)
            logger.info({ removed, retentionDays: RETENTION_DAYS }, 'Pruned login attempts');
        })
        .catch((err) => logger.error({ err }, 'Login attempt cleanup failed'));
    },
    null,
    true,
    'UTC',
  );
}

export function stopLoginAttemptCleanupJob(): void {
  job?.stop();
  job = null;
}
