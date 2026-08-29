import axios, { AxiosError, AxiosInstance } from 'axios';
import { logger } from '../../config/logger';

export type PaymentGatewayStatus = 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED';

export interface CardPaymentRequest {
  orderId: string;
  amount: number;
  email: string;
  currency?: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CardPaymentResult {
  id: string;
  ref: string;
  pcode: string;
  checkoutUrl: string;
  validUntil: string;
  orderId: string;
  amount: number;
  email: string;
  status: string;
  provider: string;
  createdAt: string;
}

export interface MobileCashinRequest {
  orderId: string;
  amount: number;
  phoneNumber: string;
  currency?: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface MobilePaymentResult {
  id: string;
  ref: string;
  orderId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  type: 'CASHIN' | 'CASHOUT';
  status: PaymentGatewayStatus;
  fee: number;
  provider?: string;
  createdAt: string;
}

export interface PaymentStatusResult {
  transaction_id: string;
  status: PaymentGatewayStatus;
  amount: number;
}

interface AfricncPayResponse<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

export class PaymentClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'PaymentClientError';
  }
}

interface PaymentClientConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
}

const RETRY_DELAYS = [200, 500, 1000];

export class PaymentClient {
  private readonly http: AxiosInstance;
  private readonly maxRetries: number;

  constructor(config: PaymentClientConfig) {
    this.maxRetries = config.maxRetries ?? 3;

    this.http = axios.create({
      baseURL: config.baseURL.replace(/\/$/, ''),
      timeout: config.timeout ?? 30000,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async initiateCardPayment(request: CardPaymentRequest): Promise<CardPaymentResult> {
    const wrapped = await this.execute<AfricncPayResponse<CardPaymentResult>>(
      'post',
      '/card/pay',
      { ...request, currency: request.currency ?? 'RWF' },
      'initiate card payment'
    );
    return wrapped.data;
  }

  async getCardPaymentByPcode(pcode: string): Promise<CardPaymentResult> {
    const wrapped = await this.execute<AfricncPayResponse<CardPaymentResult>>(
      'get',
      `/card/code/${pcode}`,
      undefined,
      `get card payment: ${pcode}`
    );
    return wrapped.data;
  }

  async mobileCashin(request: MobileCashinRequest): Promise<MobilePaymentResult> {
    const wrapped = await this.execute<AfricncPayResponse<MobilePaymentResult>>(
      'post',
      '/mobile/cashin',
      { ...request, currency: request.currency ?? 'RWF', provider: 'itec' },
      'mobile cashin'
    );
    return wrapped.data;
  }

  async getMobilePaymentByRef(ref: string): Promise<MobilePaymentResult> {
    const wrapped = await this.execute<AfricncPayResponse<MobilePaymentResult>>(
      'get',
      `/mobile/ref/${ref}`,
      undefined,
      `get mobile payment: ${ref}`
    );
    return wrapped.data;
  }

  async getPaymentStatus(ref: string): Promise<PaymentStatusResult> {
    const wrapped = await this.execute<AfricncPayResponse<PaymentStatusResult>>(
      'get',
      `/payments/ref/${ref}/status`,
      undefined,
      `get payment status: ${ref}`
    );
    return wrapped.data;
  }

  private async execute<T>(
    method: 'get' | 'post',
    path: string,
    body: unknown,
    operation: string
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = method === 'get' ? await this.http.get<T>(path) : await this.http.post<T>(path, body);
        return response.data;
      } catch (error) {
        lastError = error;
        const statusCode = (error as AxiosError).response?.status;
        const isRetryable = !statusCode || statusCode >= 500 || statusCode === 429 || statusCode === 408;

        if (!isRetryable) {
          break;
        }

        if (attempt < this.maxRetries) {
          await this.sleep(RETRY_DELAYS[Math.min(attempt - 1, RETRY_DELAYS.length - 1)]);
        }
      }
    }

    throw this.toClientError(lastError, operation);
  }

  private toClientError(error: unknown, operation: string): PaymentClientError {
    const axiosError = error as AxiosError<{ error?: { code?: string; message?: string }; message?: string }>;

    if (axiosError?.response) {
      const message =
        axiosError.response.data?.error?.message || axiosError.response.data?.message || axiosError.message;
      logger.error({ err: error, operation }, `[PaymentClient] Failed to ${operation}`);
      return new PaymentClientError(
        message,
        axiosError.response.data?.error?.code || 'HTTP_ERROR',
        axiosError.response.status
      );
    }

    logger.error({ err: error, operation }, `[PaymentClient] Failed to ${operation}`);
    return new PaymentClientError(
      error instanceof Error ? error.message : 'Unknown payment error',
      'UNKNOWN_ERROR'
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const baseURL = process.env.PAYMENT_SERVICE_URL;
const apiKey = process.env.PAYMENT_API_KEY;

if (!apiKey) {
  logger.warn('PAYMENT_API_KEY is not set; payments will not be processed');
}

export const paymentClient = baseURL && apiKey ? new PaymentClient({ baseURL, apiKey }) : null;
