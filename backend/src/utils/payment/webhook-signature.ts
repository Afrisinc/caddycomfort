import crypto from 'node:crypto';

export interface SignatureVerificationResult {
  valid: boolean;
  timestamp?: number;
  error?: string;
}

export function parseSignatureHeader(header: string): { timestamp: string; signature: string } | null {
  if (!header) return null;

  try {
    const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
    const timestamp = parts['t'];
    const signature = parts['v1'];

    if (!timestamp || !signature) return null;

    return { timestamp, signature };
  } catch {
    return null;
  }
}

export function verifyAfrisincSignature(
  secret: string,
  rawBody: string,
  header: string | undefined,
  toleranceSeconds = 300
): SignatureVerificationResult {
  if (!header) {
    return { valid: false, error: 'Missing signature header' };
  }

  const parsed = parseSignatureHeader(header);
  if (!parsed) {
    return { valid: false, error: 'Invalid signature format' };
  }

  const { timestamp, signature } = parsed;

  const timestampNum = parseInt(timestamp, 10);
  if (Number.isNaN(timestampNum)) {
    return { valid: false, error: 'Invalid timestamp' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNum) > toleranceSeconds) {
    return { valid: false, error: 'Signature timestamp expired', timestamp: timestampNum };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  try {
    const signaturesMatch = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!signaturesMatch) {
      return { valid: false, error: 'Signature mismatch', timestamp: timestampNum };
    }

    return { valid: true, timestamp: timestampNum };
  } catch {
    return { valid: false, error: 'Signature verification failed' };
  }
}
