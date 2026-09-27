import { useCallback, useEffect, useRef, useState } from 'react';
import { paymentApi } from '@/lib/api';
import type { InitiatePaymentData } from '@/lib/api/payment';

export type PaymentPhase =
  'idle' | 'starting' | 'redirecting' | 'awaiting-approval' | 'paid' | 'failed' | 'timed-out';

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 30;

export function usePayment() {
  const [phase, setPhase] = useState<PaymentPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  const poll = useCallback(async (orderId: string) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      if (cancelled.current) return;
      try {
        const { status } = await paymentApi.getStatus(orderId);
        if (cancelled.current) return;
        if (status === 'SUCCESSFUL') return setPhase('paid');
        if (status === 'FAILED') {
          setError('The payment was declined or cancelled on your phone.');
          return setPhase('failed');
        }
      } catch {
        continue;
      }
    }
    if (!cancelled.current) setPhase('timed-out');
  }, []);

  const start = useCallback(
    async (orderId: string, data: InitiatePaymentData) => {
      setError(null);
      setPhase('starting');
      try {
        const result = await paymentApi.initiate(orderId, data);
        if (result.method === 'CARD' && result.checkoutUrl) {
          setPhase('redirecting');
          window.location.assign(result.checkoutUrl);
          return;
        }
        if (result.method === 'MOBILE_MONEY') {
          setPhase('awaiting-approval');
          await poll(orderId);
          return;
        }
        setPhase('paid');
      } catch (err: any) {
        setError(err.message || 'We could not start the payment.');
        setPhase('failed');
      }
    },
    [poll],
  );

  const stopWaiting = useCallback(() => {
    cancelled.current = true;
  }, []);

  return { phase, error, start, stopWaiting };
}
