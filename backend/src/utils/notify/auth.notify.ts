import type { SendParams } from '@afrisinc/notify-sdk';
import { notify } from './notify';
import { logger } from '../../config/logger';

interface NotifyUser {
  email: string;
  firstName?: string | null;
}

const send = async (params: SendParams): Promise<void> => {
  if (!notify) {
    return;
  }

  try {
    await notify.send(params);
  } catch (error) {
    logger.error(
      { err: error, to: params.to, template: params.template },
      'Failed to send notification',
    );
  }
};

export const sendVerificationEmail = (user: NotifyUser, code: string): Promise<void> =>
  send({
    to: user.email,
    channel: 'email',
    template: 'ed11ac8a-e568-480c-bee1-74a2e7a20d74',
    data: { name: user.firstName || user.email, code },
    priority: 'high',
  });

export const sendPasswordResetEmail = (user: NotifyUser, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  return send({
    to: user.email,
    channel: 'email',
    template: 'd3891b93-db7e-4f02-a4c9-2f6709bf21f2',
    data: { name: user.firstName || user.email, token, resetUrl },
    priority: 'high',
  });
};

export const sendPasswordResetConfirmationEmail = (user: NotifyUser): Promise<void> =>
  send({
    to: user.email,
    channel: 'email',
    template: '33bd1dc7-3203-4b55-aba8-85c25b376e43',
    data: { name: user.firstName || user.email },
    priority: 'normal',
  });

export const sendPasswordChangedEmail = (user: NotifyUser): Promise<void> =>
  send({
    to: user.email,
    channel: 'email',
    template: 'b6afc2d3-5ae4-469f-9946-cde61ade3cdf',
    data: { name: user.firstName || user.email },
    priority: 'normal',
  });

export const sendWelcomeEmail = (user: NotifyUser): Promise<void> =>
  send({
    to: user.email,
    channel: 'email',
    template: '4ec3ade5-1af3-4edc-908d-cf8f4adb6018',
    data: { name: user.firstName || user.email },
    priority: 'normal',
  });
