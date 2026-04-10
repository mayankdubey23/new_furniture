import { createHmac, timingSafeEqual } from 'node:crypto';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

interface CreateRazorpayOrderInput {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  amount_due: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
}

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  return {
    keyId,
    keySecret,
  };
}

export function getRazorpayPublicConfig() {
  const { keyId, keySecret } = getRazorpayCredentials();

  return {
    enabled: Boolean(keyId && keySecret),
    keyId: keyId || null,
  };
}

export function isRazorpayConfigured() {
  return getRazorpayPublicConfig().enabled;
}

function getRazorpayAuthHeader() {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured');
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

export async function createRazorpayOrder({
  amount,
  receipt,
  notes,
}: CreateRazorpayOrderInput): Promise<RazorpayOrderResponse> {
  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization: getRazorpayAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      notes,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || 'Unable to initialize Razorpay order');
  }

  return (await response.json()) as RazorpayOrderResponse;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret } = getRazorpayCredentials();

  if (!keySecret) {
    return false;
  }

  const expectedSignature = createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  if (expectedSignature.length !== params.signature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(params.signature));
}
