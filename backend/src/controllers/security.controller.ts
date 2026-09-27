import { Request, Response } from 'express';
import {
  ATTEMPT_RANGES,
  LoginAttemptService,
  type AttemptRange,
  type AttemptStatus,
} from '../services/login-attempt.service';
import { parsePageQuery } from '../utils/pagination';

function rangeOf(value: unknown): AttemptRange {
  return ATTEMPT_RANGES.includes(value as AttemptRange) ? (value as AttemptRange) : '7d';
}

export const getLoginAttempts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const result = await LoginAttemptService.list(
      {
        range: rangeOf(req.query.range),
        status: status === 'success' || status === 'failed' ? (status as AttemptStatus) : undefined,
        search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
      },
      parsePageQuery(req.query),
    );
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch login attempts' });
  }
};

export const getLoginAttemptStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await LoginAttemptService.stats(rangeOf(req.query.range));
    res.json({ success: true, data: { stats } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch login statistics' });
  }
};
