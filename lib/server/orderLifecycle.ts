import Notification from '@/models/Notification';
import type {
  OrderStatus,
  ReturnRefundRequestStatus,
  ReturnRefundRequestType,
} from '@/models/Order';
import dbConnect from '@/lib/mongoose';
import { ORDER_TRACKING_PREFIX, SITE_NAME } from '@/lib/brand';
import { DEFAULT_SITE_SETTING, normalizeSiteSetting } from '@/lib/siteSettings';
import Setting from '@/models/Setting';
import { getAdminSettings } from '@/lib/services/adminSettings';

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
  items?: Array<{
    productId?: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
  }>;
  createdAt?: Date | string;
  paidAt?: Date | string | null;
  notes?: string;
  paymentMethod?: 'cod' | 'razorpay';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentProvider?: 'razorpay';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  returnRefundRequests?: Array<{
    _id?: unknown;
    requestType: ReturnRefundRequestType;
    status: ReturnRefundRequestStatus;
    reason: string;
    details: string;
    customerEmail: string;
    items: Array<{
      itemIndex: number;
      productId?: string;
      name: string;
      quantity: number;
    }>;
    requestedAt: Date | string;
    reviewedAt?: Date | string | null;
    resolvedAt?: Date | string | null;
    refundAmount?: number | null;
    adminNotes?: string;
  }>;
  customer: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    state?: string;
    addressLine1?: string;
    addressLine2?: string;
    address?: string;
    city?: string;
    pincode?: string;
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
  return `${ORDER_TRACKING_PREFIX}-${orderId.slice(-8).toUpperCase()}`;
}

export function normalizeTrackingReference(reference: string): string {
  return reference.trim().toUpperCase();
}

export function getStatusTitle(status: OrderStatus): string {
  return ORDER_STATUS_TITLES[status];
}

export function buildStatusMessage(order: MutableOrderRecord, status: OrderStatus): string {
  const trackingNumber = ensureTrackingMetadata(order);
  const isAwaitingOnlinePayment =
    status === 'pending' &&
    order.paymentMethod === 'razorpay' &&
    order.paymentStatus !== 'paid';

  switch (status) {
    case 'pending':
      if (isAwaitingOnlinePayment) {
        return `We've created your order and reserved tracking ID ${trackingNumber}. Complete your online payment to move it into preparation.`;
      }

      return `We've received your order and generated tracking ID ${trackingNumber} for it.`;
    case 'paid':
      return `Your payment has been confirmed and your order is now being prepared. Track it anytime with ${trackingNumber}.`;
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

function formatOrderTotal(order: MutableOrderRecord): string {
  return typeof order.totalPrice === 'number'
    ? `Rs. ${order.totalPrice.toLocaleString('en-IN')}`
    : '';
}

function formatPaymentMethod(order: MutableOrderRecord): string {
  if (order.paymentMethod === 'razorpay') {
    return order.paymentStatus === 'paid' ? 'Online payment' : 'Online payment pending';
  }

  if (order.paymentMethod === 'cod') {
    return 'Cash on Delivery';
  }

  return '';
}

function normalizeEmail(value: string | undefined | null): string {
  const email = String(value || '').trim().toLowerCase();

  if (!email || !email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    return '';
  }

  if (email.endsWith('.local')) {
    return '';
  }

  return email;
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function formatPaymentStatus(order: MutableOrderRecord): string {
  if (order.paymentMethod === 'razorpay') {
    return order.paymentStatus === 'paid' ? 'Paid successfully' : 'Awaiting payment';
  }

  return 'Cash on Delivery';
}

function formatOrderAddress(order: MutableOrderRecord): string {
  const address = order.customer || { name: '', email: '' };
  const country =
    String(address.country || '').trim().toUpperCase() === 'IN'
      ? 'India'
      : String(address.country || '').trim();

  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode,
    country,
    !address.addressLine1 ? address.address : '',
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ');
}

function buildAdminOrderItemLines(order: MutableOrderRecord): string[] {
  return Array.isArray(order.items)
    ? order.items.map((item, index) => {
        const subtotal = typeof item.price === 'number' ? item.price * item.quantity : 0;
        return `${index + 1}. ${item.name} x ${item.quantity} - Rs. ${subtotal.toLocaleString('en-IN')}`;
      })
    : [];
}

function getEmailApiKey(): string {
  return process.env.RESEND_API_KEY?.trim() || '';
}

async function sendResendEmail({
  from,
  to,
  subject,
  html,
  text,
}: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; skipped: boolean; error?: string }> {
  const apiKey = getEmailApiKey();
  const recipients = Array.from(new Set(to.map((value) => normalizeEmail(value)).filter(Boolean)));

  if (!apiKey || !from || recipients.length === 0) {
    return { sent: false, skipped: true, error: 'Email delivery is not configured.' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', errorText);
      return { sent: false, skipped: false, error: errorText };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email delivery failure';
    console.error('Failed to send email:', errorMessage);
    return { sent: false, skipped: false, error: errorMessage };
  }

  return { sent: true, skipped: false };
}

function buildOrderStatusEmailContent(order: MutableOrderRecord, status: OrderStatus) {
  const orderId = String(order._id);
  const trackingNumber = ensureTrackingMetadata(order);
  const trackingUrl = `${resolveSiteUrl()}${buildTrackingHref(orderId)}`;
  const total = formatOrderTotal(order);
  const paymentMethod = formatPaymentMethod(order);
  const isAwaitingOnlinePayment =
    status === 'pending' &&
    order.paymentMethod === 'razorpay' &&
    order.paymentStatus !== 'paid';
  const deliveryDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const detailLines = [
    `Order reference: ${orderId}`,
    `Tracking number: ${trackingNumber}`,
    total ? `Order total: ${total}` : '',
    paymentMethod ? `Payment mode: ${paymentMethod}` : '',
    deliveryDate ? `Estimated delivery: ${deliveryDate}` : '',
  ].filter(Boolean);

  switch (status) {
    case 'pending':
      return {
        subject: isAwaitingOnlinePayment
          ? `Complete payment for your ${SITE_NAME} order ${trackingNumber}`
          : `Your ${SITE_NAME} order ${trackingNumber} is confirmed`,
        eyebrow: isAwaitingOnlinePayment
          ? `${SITE_NAME} Payment Pending`
          : `${SITE_NAME} Order Confirmation`,
        heading: isAwaitingOnlinePayment
          ? 'Your order is waiting for payment'
          : 'Your order is confirmed',
        intro: isAwaitingOnlinePayment
          ? 'We created your order successfully. Complete your Razorpay payment to move it into preparation and dispatch.'
          : "We've received your order successfully. Your tracking ID is active now, and you can use it anytime to follow the latest status.",
        statusLabel: isAwaitingOnlinePayment ? 'Payment Status' : 'Order Status',
        statusValue: isAwaitingOnlinePayment ? 'Awaiting online payment' : 'Order received',
        detailLines,
        trackingUrl,
      };
    case 'paid':
      return {
        subject: `Payment confirmed for your ${SITE_NAME} order ${trackingNumber}`,
        eyebrow: `${SITE_NAME} Payment Confirmation`,
        heading: 'Your payment is confirmed',
        intro:
          'Your online payment was successful, and your order is now moving into preparation for dispatch.',
        statusLabel: 'Payment Status',
        statusValue: 'Paid successfully',
        detailLines,
        trackingUrl,
      };
    case 'shipped':
      return {
        subject: `Your ${SITE_NAME} order ${trackingNumber} has shipped`,
        eyebrow: `${SITE_NAME} Order Update`,
        heading: 'Your order is on the way',
        intro:
          'Your shipment has left the studio and is now moving toward delivery.',
        statusLabel: 'Shipment Status',
        statusValue: 'Shipped',
        detailLines,
        trackingUrl,
      };
    case 'delivered':
      return {
        subject: `Your ${SITE_NAME} order ${trackingNumber} has been delivered`,
        eyebrow: `${SITE_NAME} Order Update`,
        heading: 'Your order was delivered',
        intro:
          'Your order has been marked as delivered. We hope it feels perfect in your space.',
        statusLabel: 'Delivery Status',
        statusValue: 'Delivered',
        detailLines,
        trackingUrl,
      };
    default:
      return null;
  }
}

function resolveOrderStatusSender() {
  const from =
    process.env.ORDER_STATUS_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    '';
  const senderName = (process.env.ORDER_STATUS_FROM_NAME || `${SITE_NAME} Orders`).trim();

  if (!from) {
    return '';
  }

  if (from.includes('<')) {
    return from;
  }

  return senderName ? `${senderName} <${from}>` : from;
}

async function resolveOrderAlertRecipients(): Promise<string[]> {
  await dbConnect();

  const [adminSettings, siteSettingRecord] = await Promise.all([
    getAdminSettings(),
    Setting.findOne({}).sort({ createdAt: -1 }).lean(),
  ]);

  if (!adminSettings.notifications.orderAlerts) {
    return [];
  }

  const siteSetting = siteSettingRecord
    ? normalizeSiteSetting(siteSettingRecord)
    : DEFAULT_SITE_SETTING;

  return [
    process.env.ADMIN_EMAIL,
    adminSettings.adminProfile.email,
    siteSetting.email,
  ]
    .map((value) => normalizeEmail(value))
    .filter(Boolean);
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

export async function sendOrderStatusEmail(
  order: MutableOrderRecord,
  status: OrderStatus
): Promise<{ sent: boolean; skipped: boolean; error?: string }> {
  const content = buildOrderStatusEmailContent(order, status);
  if (!content) {
    return { sent: false, skipped: true };
  }

  const from = resolveOrderStatusSender();
  const to = normalizeEmail(order.customer.email);

  if (!from || !to) {
    return { sent: false, skipped: true, error: 'Email delivery is not configured.' };
  }

  const customerName = escapeHtml(order.customer.name || 'there');
  const escapedTrackingUrl = escapeHtml(content.trackingUrl);
  const detailLinesHtml = content.detailLines
    .map(
      (line) =>
        `<p style="margin:8px 0 0; font-size:15px; color:#5b3a29;">${escapeHtml(line)}</p>`
    )
    .join('');
  const text = [
    `Hi ${order.customer.name || 'there'},`,
    '',
    content.heading,
    content.intro,
    ...content.detailLines,
    `Track your order: ${content.trackingUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; background:#f7f1eb; padding:32px; color:#2a211c;">
      <div style="max-width:620px; margin:0 auto; background:#fffdf9; border:1px solid rgba(110,74,51,0.14); border-radius:24px; overflow:hidden;">
        <div style="padding:28px 32px; background:linear-gradient(135deg, rgba(110,74,51,0.98), rgba(42,33,28,1)); color:#f8f7f3;">
          <div style="font-size:12px; letter-spacing:0.35em; text-transform:uppercase; opacity:0.76;">${escapeHtml(content.eyebrow)}</div>
          <h1 style="margin:14px 0 0; font-size:34px; font-weight:500;">${escapeHtml(content.heading)}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px; font-size:16px; line-height:1.7;">Hi ${customerName}, ${escapeHtml(content.intro)}</p>
          <div style="margin:0 0 20px; padding:20px; border:1px solid rgba(110,74,51,0.12); border-radius:20px; background:rgba(243,236,229,0.7);">
            <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:0.28em; color:#7a4e36;">${escapeHtml(content.statusLabel)}</p>
            <p style="margin:10px 0 0; font-size:22px; letter-spacing:0.08em; color:#2a211c;">${escapeHtml(content.statusValue)}</p>
            ${detailLinesHtml}
          </div>
          <a href="${escapedTrackingUrl}" style="display:inline-block; padding:14px 24px; border-radius:999px; background:#6e4a33; color:#ffffff; text-decoration:none; font-size:13px; letter-spacing:0.22em; text-transform:uppercase; font-weight:700;">Track Order</a>
        </div>
      </div>
    </div>
  `;

  return sendResendEmail({
    from,
    to: [to],
    subject: content.subject,
    html,
    text,
  });
}

export async function sendShipmentEmail(
  order: MutableOrderRecord,
  status: OrderStatus
): Promise<{ sent: boolean; skipped: boolean; error?: string }> {
  if (status !== 'shipped') {
    return { sent: false, skipped: true };
  }

  return sendOrderStatusEmail(order, status);
}

export async function sendAdminNewOrderAlertEmail(
  order: MutableOrderRecord
): Promise<{ sent: boolean; skipped: boolean; error?: string }> {
  const from = resolveOrderStatusSender();
  const recipients = await resolveOrderAlertRecipients();

  if (!from || recipients.length === 0) {
    return { sent: false, skipped: true, error: 'Order alert email recipients are not configured.' };
  }

  const orderId = String(order._id);
  const trackingNumber = ensureTrackingMetadata(order);
  const submittedAt = formatDateTime(order.paidAt || order.createdAt);
  const orderTotal = formatOrderTotal(order);
  const paymentMethod = formatPaymentMethod(order);
  const paymentStatus = formatPaymentStatus(order);
  const deliveryAddress = formatOrderAddress(order);
  const itemLines = buildAdminOrderItemLines(order);
  const notes = String(order.notes || '').trim();
  const detailLines = [
    `Order reference: ${orderId}`,
    `Tracking number: ${trackingNumber}`,
    submittedAt ? `Received at: ${submittedAt}` : '',
    orderTotal ? `Order total: ${orderTotal}` : '',
    paymentMethod ? `Payment mode: ${paymentMethod}` : '',
    paymentStatus ? `Payment status: ${paymentStatus}` : '',
    order.gatewayOrderId ? `Razorpay order ID: ${order.gatewayOrderId}` : '',
    order.gatewayPaymentId ? `Razorpay payment ID: ${order.gatewayPaymentId}` : '',
    `Customer: ${order.customer.name}`,
    order.customer.email ? `Customer email: ${order.customer.email}` : '',
    order.customer.phone ? `Customer phone: ${order.customer.phone}` : '',
    deliveryAddress ? `Delivery address: ${deliveryAddress}` : '',
    notes ? `Customer notes: ${notes}` : '',
  ].filter(Boolean);

  const detailLinesHtml = detailLines
    .map(
      (line) =>
        `<p style="margin:8px 0 0; font-size:15px; color:#5b3a29;">${escapeHtml(line)}</p>`
    )
    .join('');
  const itemLinesHtml = itemLines.length
    ? itemLines
        .map(
          (line) =>
            `<li style="margin:10px 0 0; color:#2a211c; font-size:15px; line-height:1.6;">${escapeHtml(line)}</li>`
        )
        .join('')
    : '<li style="margin:10px 0 0; color:#2a211c; font-size:15px; line-height:1.6;">No line items recorded.</li>';
  const text = [
    `New order received for ${SITE_NAME}.`,
    '',
    ...detailLines,
    '',
    'Items:',
    ...itemLines.map((line) => `- ${line}`),
  ].join('\n');

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; background:#f7f1eb; padding:32px; color:#2a211c;">
      <div style="max-width:700px; margin:0 auto; background:#fffdf9; border:1px solid rgba(110,74,51,0.14); border-radius:24px; overflow:hidden;">
        <div style="padding:28px 32px; background:linear-gradient(135deg, rgba(110,74,51,0.98), rgba(42,33,28,1)); color:#f8f7f3;">
          <div style="font-size:12px; letter-spacing:0.35em; text-transform:uppercase; opacity:0.76;">${escapeHtml(SITE_NAME)} New Order</div>
          <h1 style="margin:14px 0 0; font-size:34px; font-weight:500;">${escapeHtml(trackingNumber)}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px; font-size:16px; line-height:1.7;">A new customer order is ready for review.</p>
          <div style="margin:0 0 20px; padding:20px; border:1px solid rgba(110,74,51,0.12); border-radius:20px; background:rgba(243,236,229,0.7);">
            ${detailLinesHtml}
          </div>
          <div style="padding:20px; border:1px solid rgba(110,74,51,0.12); border-radius:20px;">
            <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:0.28em; color:#7a4e36;">Items</p>
            <ol style="margin:14px 0 0; padding-left:20px;">
              ${itemLinesHtml}
            </ol>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendResendEmail({
    from,
    to: recipients,
    subject: `New order received - ${trackingNumber}`,
    html,
    text,
  });
}

export function sanitizeOrderForClient(order: Record<string, unknown>) {
  const { gatewayOrderId, gatewayPaymentId, __v, ...safeOrder } = order;
  void gatewayOrderId;
  void gatewayPaymentId;
  void __v;
  return safeOrder;
}
