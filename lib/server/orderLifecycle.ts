import Notification from '@/models/Notification';
import type { OrderStatus } from '@/models/Order';

export interface OrderTimelineEntry {
  status: OrderStatus;
  title: string;
  message: string;
  createdAt: Date;
}

export interface MutableOrderRecord {
  _id: unknown;
  status: OrderStatus;
  trackingNumber?: string | null;
  estimatedDelivery?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  statusTimeline?: OrderTimelineEntry[];
  totalPrice?: number;
  createdAt?: Date | string;
  customer: {
    name: string;
    email: string;
  };
}

const ORDER_STATUS_TITLES: Record<OrderStatus, string> = {
  pending: 'Order received',
  paid: 'Payment confirmed',
  shipped: 'Order shipped',
  delivered: 'Order delivered',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildTrackingNumber(orderId: string): string {
  return `LUXE-${orderId.slice(-8).toUpperCase()}`;
}

export function normalizeTrackingReference(reference: string): string {
  return reference.trim().toUpperCase();
}

export function getStatusTitle(status: OrderStatus): string {
  return ORDER_STATUS_TITLES[status];
}

export function buildStatusMessage(order: MutableOrderRecord, status: OrderStatus): string {
  const trackingNumber = ensureTrackingMetadata(order);

  switch (status) {
    case 'pending':
      return `We've received your order and started processing it for dispatch.`;
    case 'paid':
      return `Your payment has been confirmed and your order is now being prepared.`;
    case 'shipped':
      return `Your order is now on the way. Track it anytime with ${trackingNumber}.`;
    case 'delivered':
      return `Your order has been marked as delivered. We hope it feels perfect in your space.`;
    default:
      return 'Your order status has been updated.';
  }
}

export function ensureTrackingMetadata(order: MutableOrderRecord): string {
  const current = String(order.trackingNumber || '').trim().toUpperCase();
  if (current) {
    order.trackingNumber = current;
    return current;
  }

  const generated = buildTrackingNumber(String(order._id));
  order.trackingNumber = generated;
  return generated;
}

export function appendStatusTimelineEntry(
  order: MutableOrderRecord,
  status: OrderStatus,
  options?: { force?: boolean; message?: string }
): boolean {
  const timeline = Array.isArray(order.statusTimeline) ? [...order.statusTimeline] : [];

  if (!options?.force && timeline.some((entry) => entry.status === status)) {
    return false;
  }

  timeline.push({
    status,
    title: getStatusTitle(status),
    message: options?.message?.trim() || buildStatusMessage(order, status),
    createdAt: new Date(),
  });

  timeline.sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

  order.statusTimeline = timeline;
  return true;
}

export function applyStatusTransition(order: MutableOrderRecord, nextStatus: OrderStatus): boolean {
  if (order.status === nextStatus) {
    return false;
  }

  if (!Array.isArray(order.statusTimeline) || order.statusTimeline.length === 0) {
    appendStatusTimelineEntry(order, order.status, { force: true });
  }

  order.status = nextStatus;
  ensureTrackingMetadata(order);

  if (nextStatus === 'shipped') {
    order.shippedAt = order.shippedAt || new Date();
    order.estimatedDelivery = order.estimatedDelivery || addDays(new Date(), 7);
  }

  if (nextStatus === 'delivered') {
    order.deliveredAt = order.deliveredAt || new Date();
  }

  appendStatusTimelineEntry(order, nextStatus);
  return true;
}

function resolveSiteUrl(): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  return (siteUrl || 'http://localhost:3000').replace(/\/$/, '');
}

function buildTrackingHref(orderId: string): string {
  return `/track-order?orderId=${encodeURIComponent(orderId)}`;
}

export async function createOrderStatusNotification(
  order: MutableOrderRecord,
  status: OrderStatus
): Promise<void> {
  const email = order.customer.email?.trim().toLowerCase();
  if (!email) return;

  const orderId = String(order._id);
  await Notification.create({
    email,
    type: 'order-status',
    orderId,
    trackingNumber: ensureTrackingMetadata(order),
    status,
    title: getStatusTitle(status),
    message: buildStatusMessage(order, status),
    href: buildTrackingHref(orderId),
    read: false,
  });
}

export async function sendShipmentEmail(
  order: MutableOrderRecord,
  status: OrderStatus
): Promise<{ sent: boolean; skipped: boolean; error?: string }> {
  if (status !== 'shipped') {
    return { sent: false, skipped: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.ORDER_STATUS_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM;
  const to = order.customer.email?.trim().toLowerCase();

  if (!apiKey || !from || !to) {
    return { sent: false, skipped: true, error: 'Email delivery is not configured.' };
  }

  const orderId = String(order._id);
  const trackingNumber = ensureTrackingMetadata(order);
  const trackingUrl = `${resolveSiteUrl()}${buildTrackingHref(orderId)}`;
  const customerName = escapeHtml(order.customer.name || 'there');
  const deliveryDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'soon';
  const priceLine =
    typeof order.totalPrice === 'number'
      ? `Order total: Rs. ${order.totalPrice.toLocaleString('en-IN')}`
      : '';

  const subject = `Your LUXE order ${trackingNumber} has shipped`;
  const text = [
    `Hi ${order.customer.name || 'there'},`,
    '',
    'Your LUXE order has shipped.',
    `Tracking number: ${trackingNumber}`,
    `Estimated delivery: ${deliveryDate}`,
    priceLine,
    `Track your order: ${trackingUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; background:#f7f1eb; padding:32px; color:#2a211c;">
      <div style="max-width:620px; margin:0 auto; background:#fffdf9; border:1px solid rgba(110,74,51,0.14); border-radius:24px; overflow:hidden;">
        <div style="padding:28px 32px; background:linear-gradient(135deg, rgba(110,74,51,0.98), rgba(42,33,28,1)); color:#f8f7f3;">
          <div style="font-size:12px; letter-spacing:0.35em; text-transform:uppercase; opacity:0.76;">LUXE Order Update</div>
          <h1 style="margin:14px 0 0; font-size:34px; font-weight:500;">Your order is on the way</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px; font-size:16px; line-height:1.7;">Hi ${customerName}, your shipment has left the studio and is now moving toward delivery.</p>
          <div style="margin:0 0 20px; padding:20px; border:1px solid rgba(110,74,51,0.12); border-radius:20px; background:rgba(243,236,229,0.7);">
            <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:0.28em; color:#7a4e36;">Tracking Number</p>
            <p style="margin:10px 0 0; font-size:22px; letter-spacing:0.08em; color:#2a211c;">${trackingNumber}</p>
            <p style="margin:14px 0 0; font-size:15px; color:#5b3a29;">Estimated delivery: ${escapeHtml(deliveryDate)}</p>
            ${priceLine ? `<p style="margin:6px 0 0; font-size:15px; color:#5b3a29;">${escapeHtml(priceLine)}</p>` : ''}
          </div>
          <a href="${trackingUrl}" style="display:inline-block; padding:14px 24px; border-radius:999px; background:#6e4a33; color:#ffffff; text-decoration:none; font-size:13px; letter-spacing:0.22em; text-transform:uppercase; font-weight:700;">Track Order</a>
        </div>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send shipment email:', errorText);
    return { sent: false, skipped: false, error: errorText };
  }

  return { sent: true, skipped: false };
}

export function sanitizeOrderForClient(order: Record<string, unknown>) {
  const { gatewayOrderId, gatewayPaymentId, __v, ...safeOrder } = order;
  void gatewayOrderId;
  void gatewayPaymentId;
  void __v;
  return safeOrder;
}
