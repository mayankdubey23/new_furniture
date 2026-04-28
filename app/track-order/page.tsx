'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AnimatedHeading from '@/components/AnimatedHeading';
import { useUser } from '@/context/UserContext';
import { getApiUrl } from '@/lib/api/browser';
import { ORDER_TRACKING_PREFIX, SITE_NAME } from '@/lib/brand';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';
type ReturnRefundRequestType = 'return' | 'refund' | 'exchange' | 'return-refund';
type ReturnRefundRequestStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'refunded'
  | 'closed';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface TimelineEntry {
  status: OrderStatus;
  title: string;
  message: string;
  createdAt: string;
}

interface ReturnRefundRequestItem {
  itemIndex: number;
  productId?: string;
  name: string;
  quantity: number;
}

interface ReturnRefundRequest {
  _id: string;
  requestType: ReturnRefundRequestType;
  status: ReturnRefundRequestStatus;
  reason: string;
  details: string;
  customerEmail: string;
  items: ReturnRefundRequestItem[];
  requestedAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
  refundAmount?: number;
  adminNotes?: string;
}

interface TrackedOrder {
  _id: string;
  trackingNumber?: string;
  totalPrice: number;
  totalItems: number;
  status: OrderStatus;
  paymentMethod?: 'cod' | 'razorpay';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt?: string;
  estimatedDelivery?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    addressLine1?: string;
    addressLine2?: string;
    city: string;
    state?: string;
    pincode: string;
  };
  items: OrderItem[];
  statusTimeline?: TimelineEntry[];
  returnRefundRequests?: ReturnRefundRequest[];
}

const ORDER_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending', label: 'Placed' },
  { key: 'paid', label: 'Paid' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const RETURN_REQUEST_REASONS = [
  'Damaged item',
  'Wrong item delivered',
  'Exchange requested',
  'Product mismatch',
  'Quality issue',
  'Delivery issue',
  'Changed my mind',
  'Payment or refund issue',
  'Other',
];

function getReturnRequestTypeLabel(value: ReturnRefundRequestType) {
  switch (value) {
    case 'return':
      return 'Return';
    case 'refund':
      return 'Refund';
    case 'exchange':
      return 'Exchange';
    case 'return-refund':
      return 'Return + Refund';
    default:
      return 'Request';
  }
}

function getReturnRequestStatusLabel(value: ReturnRefundRequestStatus) {
  switch (value) {
    case 'requested':
      return 'Requested';
    case 'approved':
      return 'Approved';
    case 'received':
      return 'Item Received';
    case 'refunded':
      return 'Refunded';
    case 'rejected':
      return 'Rejected';
    case 'closed':
      return 'Closed';
    default:
      return value;
  }
}

function getReturnRequestStatusClass(value: ReturnRefundRequestStatus) {
  switch (value) {
    case 'requested':
      return 'border-amber-300/70 bg-amber-50 text-amber-700';
    case 'approved':
      return 'border-blue-300/70 bg-blue-50 text-blue-700';
    case 'received':
      return 'border-violet-300/70 bg-violet-50 text-violet-700';
    case 'refunded':
      return 'border-emerald-300/70 bg-emerald-50 text-emerald-700';
    case 'rejected':
      return 'border-red-300/70 bg-red-50 text-red-700';
    case 'closed':
      return 'border-theme-line/60 bg-theme-ivory/62 text-theme-walnut/62';
    default:
      return 'border-theme-line/60 bg-theme-ivory/62 text-theme-walnut/62';
  }
}

function formatDateTime(value?: string) {
  if (!value) return 'Pending update';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDeliveryDate(value?: string) {
  if (!value) return 'Will be shared after dispatch';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function TrackOrderPageFallback() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Order Tracking</p>
          <AnimatedHeading as="h1" className="mt-3 font-display text-5xl text-theme-ink dark:text-theme-ivory md:text-6xl">
            Track Your {SITE_NAME} Order
          </AnimatedHeading>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/64">
            Loading your tracking panel...
          </p>
        </div>

        <div className="section-shell rounded-[2rem] border border-theme-line/50 p-8">
          <div className="h-56 animate-pulse rounded-[1.6rem] bg-theme-ivory/40 dark:bg-white/5" />
        </div>
      </div>
    </main>
  );
}

function TrackOrderPageContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const autoLookupRef = useRef('');
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [requestType, setRequestType] = useState<ReturnRefundRequestType>('return');
  const [requestReason, setRequestReason] = useState(RETURN_REQUEST_REASONS[0]);
  const [requestDetails, setRequestDetails] = useState('');
  const [selectedItemIndexes, setSelectedItemIndexes] = useState<number[]>([]);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const timeline = useMemo(() => {
    if (!order?.statusTimeline?.length) return [];
    return [...order.statusTimeline].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  }, [order]);

  const completedStatuses = useMemo(
    () => new Set((order?.statusTimeline || []).map((entry) => entry.status)),
    [order]
  );

  const requestable = useMemo(() => {
    if (!order) return false;
    return (
      order.status === 'paid' ||
      order.status === 'shipped' ||
      order.status === 'delivered'
    );
  }, [order]);

  const activeReturnRequest = useMemo(
    () =>
      order?.returnRefundRequests?.find((entry) =>
        ['requested', 'approved', 'received', 'refunded'].includes(entry.status)
      ) || null,
    [order]
  );

  const lookupOrder = useCallback(
    async (nextReference?: string, nextEmail?: string) => {
      const referenceValue = (nextReference ?? reference).trim();
      const viewerEmail = (user?.email || nextEmail || email).trim().toLowerCase();

      if (!referenceValue) {
        setErrorMsg('Please enter your order ID or tracking number.');
        return;
      }

      if (!viewerEmail) {
        setErrorMsg('Please enter the email used during checkout.');
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const response = await fetch(getApiUrl('/api/orders/track'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: referenceValue,
            email: viewerEmail,
          }),
          credentials: 'include',
        });

        const data = (await response.json()) as TrackedOrder & { error?: string };
        if (!response.ok) {
          throw new Error(data.error || 'Unable to find that order.');
        }

        setOrder(data);
        setSelectedItemIndexes(
          Array.isArray(data.items) ? data.items.map((_, index) => index) : []
        );
        setRequestMessage('');
      } catch (error) {
        setOrder(null);
        setErrorMsg(error instanceof Error ? error.message : 'Unable to track your order.');
      } finally {
        setLoading(false);
      }
    },
    [email, reference, user?.email]
  );

  const toggleSelectedItem = (index: number) => {
    setSelectedItemIndexes((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index].sort((left, right) => left - right)
    );
  };

  const submitReturnRefundRequest = async () => {
    if (!order) {
      return;
    }

    const viewerEmail = (user?.email || email).trim().toLowerCase();

    if (!viewerEmail) {
      setRequestMessage('Please provide the checkout email before submitting a request.');
      return;
    }

    if (!selectedItemIndexes.length) {
      setRequestMessage('Select at least one item for the return/refund request.');
      return;
    }

    if (!requestDetails.trim()) {
      setRequestMessage('Add a short explanation so the support team can review it quickly.');
      return;
    }

    setRequestSubmitting(true);
    setRequestMessage('');

    try {
      const response = await fetch(getApiUrl(`/api/orders/${order._id}/returns`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: viewerEmail,
          requestType,
          reason: requestReason,
          details: requestDetails,
          items: selectedItemIndexes.map((itemIndex) => ({
            itemIndex,
            quantity: order.items[itemIndex]?.quantity || 1,
          })),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        order?: TrackedOrder;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit your return/refund request.');
      }

      if (data.order) {
        setOrder(data.order);
      }

      setRequestDetails('');
      setRequestMessage(
        data.message || 'Your return/refund request has been submitted successfully.'
      );
    } catch (error) {
      setRequestMessage(
        error instanceof Error
          ? error.message
          : 'Unable to submit your return/refund request.'
      );
    } finally {
      setRequestSubmitting(false);
    }
  };

  useEffect(() => {
    const orderId = searchParams.get('orderId') || '';
    if (orderId) {
      setReference(orderId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    const orderId = searchParams.get('orderId') || '';
    if (!orderId || !user?.email) return;

    const lookupKey = `${orderId}:${user.email.toLowerCase()}`;
    if (autoLookupRef.current === lookupKey) return;

    autoLookupRef.current = lookupKey;
    void lookupOrder(orderId, user.email);
  }, [lookupOrder, searchParams, user?.email]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Order Tracking</p>
          <AnimatedHeading as="h1" className="mt-3 font-display text-5xl text-theme-ink dark:text-theme-ivory md:text-6xl">
            Track Your {SITE_NAME} Order
          </AnimatedHeading>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/64">
            Enter your order ID or tracking number to see the latest shipment progress, delivery estimate, and status timeline.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="section-shell rounded-[2rem] border border-theme-line/50 p-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Find Order</p>
            <div className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                  Order ID or Tracking Number
                </label>
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder={`e.g. 67f5... or ${ORDER_TRACKING_PREFIX}-AB12CD34`}
                  className="w-full rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory"
                />
              </div>

              {user ? (
                <div className="rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/58 px-4 py-4 dark:bg-white/5">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Signed-in Email</p>
                  <p className="mt-2 text-sm text-theme-ink dark:text-theme-ivory">{user.email}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
                    Checkout Email
                  </label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory"
                  />
                </div>
              )}

              {errorMsg ? (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {errorMsg}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void lookupOrder()}
                disabled={loading}
                className="w-full rounded-full bg-theme-ink py-4 text-sm font-bold uppercase tracking-[0.28em] text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)]"
              >
                {loading ? 'Tracking Order...' : 'Track Order'}
              </button>

              <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/50 px-4 py-4 text-sm leading-7 text-theme-walnut/64 dark:bg-white/5 dark:text-theme-ivory/60">
                Order confirmation emails are sent after checkout, and shipment emails follow as soon as the order is dispatched.
              </div>
            </div>
          </section>

          <section className="section-shell rounded-[2rem] border border-theme-line/50 p-8">
            {order ? (
              <div className="space-y-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Live Status</p>
                    <AnimatedHeading as="h2" className="mt-3 font-display text-4xl text-theme-ink dark:text-theme-ivory">
                      {order.status === 'pending'
                        ? 'Order Received'
                        : order.status === 'paid'
                          ? 'Payment Confirmed'
                          : order.status === 'shipped'
                            ? 'Shipment In Transit'
                            : 'Delivered'}
                    </AnimatedHeading>
                    <p className="mt-3 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/64">
                      Tracking number: <span className="font-semibold text-theme-ink dark:text-theme-ivory">{order.trackingNumber || 'Generating shortly'}</span>
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/62 px-5 py-4 dark:bg-white/5">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">Estimated Delivery</p>
                    <p className="mt-2 text-lg font-semibold text-theme-ink dark:text-theme-ivory">
                      {formatDeliveryDate(order.estimatedDelivery)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {ORDER_STEPS.map((step) => {
                    const active = completedStatuses.has(step.key) || order.status === step.key;
                    return (
                      <div
                        key={step.key}
                        className={`rounded-[1.4rem] border px-4 py-4 ${
                          active
                            ? 'border-theme-bronze/40 bg-theme-bronze/10'
                            : 'border-theme-line/50 bg-white/50 dark:bg-white/5'
                        }`}
                      >
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                          {step.label}
                        </p>
                        <p className="mt-2 text-sm text-theme-walnut/70 dark:text-theme-ivory/64">
                          {active ? 'Completed' : 'Awaiting'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/50 p-5 dark:bg-white/5">
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Timeline</p>
                    <div className="mt-4 space-y-3">
                      {timeline.map((entry) => (
                        <div key={`${entry.status}-${entry.createdAt}`} className="rounded-[1.2rem] border border-theme-line/40 bg-theme-ivory/58 px-4 py-4 dark:bg-white/5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-theme-bronze">{entry.status}</p>
                              <p className="mt-1 text-base font-semibold text-theme-ink dark:text-theme-ivory">{entry.title}</p>
                            </div>
                            <p className="text-xs text-theme-walnut/52 dark:text-theme-ivory/50">{formatDateTime(entry.createdAt)}</p>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-theme-walnut/66 dark:text-theme-ivory/62">{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/50 p-5 dark:bg-white/5">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Order Summary</p>
                      <div className="mt-4 space-y-2 text-sm text-theme-ink dark:text-theme-ivory">
                        <p>Order reference: {order._id}</p>
                        <p>Total items: {order.totalItems}</p>
                        <p>Total value: Rs. {order.totalPrice.toLocaleString('en-IN')}</p>
                        <p>Payment mode: {order.paymentMethod === 'razorpay' ? 'Online payment' : 'Cash on Delivery'}</p>
                        <p>Payment status: {order.paymentStatus || 'pending'}</p>
                        <p>Placed on: {formatDateTime(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/50 p-5 dark:bg-white/5">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Delivery Address</p>
                      <div className="mt-4 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
                        <p className="font-semibold text-theme-ink dark:text-theme-ivory">{order.customer.name}</p>
                        <p>{order.customer.addressLine1 || order.customer.address}</p>
                        {order.customer.addressLine2 ? <p>{order.customer.addressLine2}</p> : null}
                        <p>
                          {order.customer.city}
                          {order.customer.state ? `, ${order.customer.state}` : ''} - {order.customer.pincode}
                        </p>
                        <p>{order.customer.email}</p>
                        <p>{order.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/50 p-5 dark:bg-white/5">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Items</p>
                  <div className="mt-4 space-y-3">
                    {order.items.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-theme-line/40 bg-theme-ivory/58 px-4 py-4 dark:bg-white/5">
                        <div>
                          <p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">{item.name}</p>
                          <p className="mt-1 text-xs text-theme-walnut/58 dark:text-theme-ivory/56">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-theme-bronze">
                          Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/50 p-5 dark:bg-white/5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                        Returns & Refunds
                      </p>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/62">
                        Use this panel to request a return, refund, exchange, or combined resolution for eligible orders.
                      </p>
                    </div>
                    {activeReturnRequest ? (
                      <span
                        className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${getReturnRequestStatusClass(activeReturnRequest.status)}`}
                      >
                        {getReturnRequestStatusLabel(activeReturnRequest.status)}
                      </span>
                    ) : null}
                  </div>

                  {order.returnRefundRequests?.length ? (
                    <div className="mt-4 space-y-3">
                      {order.returnRefundRequests
                        .slice()
                        .sort(
                          (left, right) =>
                            new Date(right.requestedAt).getTime() -
                            new Date(left.requestedAt).getTime()
                        )
                        .map((request) => (
                          <div
                            key={request._id}
                            className="rounded-[1.2rem] border border-theme-line/40 bg-theme-ivory/58 px-4 py-4 dark:bg-white/5"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                                  {getReturnRequestTypeLabel(request.requestType)}
                                </p>
                                <p className="mt-1 text-base font-semibold text-theme-ink dark:text-theme-ivory">
                                  {request.reason}
                                </p>
                              </div>
                              <span
                                className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${getReturnRequestStatusClass(request.status)}`}
                              >
                                {getReturnRequestStatusLabel(request.status)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-theme-walnut/66 dark:text-theme-ivory/62">
                              {request.details}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-theme-walnut/58 dark:text-theme-ivory/56">
                              <span>Requested {formatDateTime(request.requestedAt)}</span>
                              {typeof request.refundAmount === 'number' ? (
                                <span>Refund Rs. {request.refundAmount.toLocaleString('en-IN')}</span>
                              ) : null}
                            </div>
                            {request.items?.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {request.items.map((item) => (
                                  <span
                                    key={`${request._id}-${item.itemIndex}`}
                                    className="rounded-full border border-theme-line/50 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-theme-walnut/62 dark:text-theme-ivory/58"
                                  >
                                    {item.name} x {item.quantity}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            {request.adminNotes ? (
                              <p className="mt-3 rounded-[1rem] border border-theme-line/40 bg-white/65 px-3 py-3 text-sm text-theme-walnut/66 dark:bg-white/8 dark:text-theme-ivory/62">
                                Team note: {request.adminNotes}
                              </p>
                            ) : null}
                          </div>
                        ))}
                    </div>
                  ) : null}

                  {requestable ? (
                    <div className="mt-5 rounded-[1.4rem] border border-theme-line/40 bg-white/60 p-4 dark:bg-white/5">
                      <div className="grid gap-4 lg:grid-cols-[220px_220px_1fr]">
                        <div>
                          <label className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                            Request Type
                          </label>
                          <select
                            value={requestType}
                            onChange={(event) =>
                              setRequestType(event.target.value as ReturnRefundRequestType)
                            }
                            disabled={Boolean(activeReturnRequest) || requestSubmitting}
                            className="mt-2 w-full rounded-xl border border-theme-line/60 bg-white px-3 py-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:bg-white/10 dark:text-theme-ivory"
                          >
                            <option value="return">Return</option>
                            <option value="refund">Refund</option>
                            <option value="exchange">Exchange</option>
                            <option value="return-refund">Return + Refund</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                            Reason
                          </label>
                          <select
                            value={requestReason}
                            onChange={(event) => setRequestReason(event.target.value)}
                            disabled={Boolean(activeReturnRequest) || requestSubmitting}
                            className="mt-2 w-full rounded-xl border border-theme-line/60 bg-white px-3 py-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:bg-white/10 dark:text-theme-ivory"
                          >
                            {RETURN_REQUEST_REASONS.map((reason) => (
                              <option key={reason} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                            Details
                          </label>
                          <textarea
                            rows={4}
                            value={requestDetails}
                            onChange={(event) => setRequestDetails(event.target.value.slice(0, 1200))}
                            disabled={Boolean(activeReturnRequest) || requestSubmitting}
                            placeholder="Describe the issue and what resolution you expect."
                            className="mt-2 w-full rounded-xl border border-theme-line/60 bg-white px-3 py-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:bg-white/10 dark:text-theme-ivory"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                          Select Items
                        </p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {order.items.map((item, index) => (
                            <label
                              key={`${item.name}-${index}`}
                              className="flex cursor-pointer items-start gap-3 rounded-[1rem] border border-theme-line/40 bg-theme-ivory/58 px-3 py-3 dark:bg-white/5"
                            >
                              <input
                                type="checkbox"
                                checked={selectedItemIndexes.includes(index)}
                                onChange={() => toggleSelectedItem(index)}
                                disabled={Boolean(activeReturnRequest) || requestSubmitting}
                                className="mt-1 h-4 w-4 rounded border-theme-line text-theme-bronze focus:ring-theme-bronze"
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                                  {item.name}
                                </span>
                                <span className="mt-1 block text-xs text-theme-walnut/60 dark:text-theme-ivory/56">
                                  Qty: {item.quantity} | Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {requestMessage ? (
                        <div className="mt-4 rounded-xl border border-theme-line/40 bg-theme-ivory/58 px-4 py-3 text-sm text-theme-walnut/68 dark:bg-white/5 dark:text-theme-ivory/62">
                          {requestMessage}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void submitReturnRefundRequest()}
                          disabled={Boolean(activeReturnRequest) || requestSubmitting}
                          className="rounded-full bg-theme-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-theme-bronze disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                        {activeReturnRequest ? (
                          <p className="text-sm text-theme-walnut/60 dark:text-theme-ivory/56">
                            A request is already under review for this order.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.2rem] border border-theme-line/40 bg-theme-ivory/58 px-4 py-4 text-sm text-theme-walnut/66 dark:bg-white/5 dark:text-theme-ivory/60">
                      Return/refund requests become available after payment confirmation or when the order starts moving toward delivery.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.8rem] border border-theme-line/50 bg-white/50 px-6 py-14 text-center dark:bg-white/5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Tracking Panel</p>
                <AnimatedHeading as="h2" className="mt-4 font-display text-4xl text-theme-ink dark:text-theme-ivory">
                  Awaiting your order reference
                </AnimatedHeading>
                <p className="mt-4 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">
                  Once you submit your order ID or tracking number, we will show the latest delivery timeline here.
                </p>
                <div className="mt-8">
                  <Link
                    href="/"
                    className="inline-flex rounded-full bg-theme-bronze px-8 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-ink"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackOrderPageFallback />}>
      <TrackOrderPageContent />
    </Suspense>
  );
}
