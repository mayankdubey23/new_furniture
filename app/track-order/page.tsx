'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AnimatedHeading from '@/components/AnimatedHeading';
import { useUser } from '@/context/UserContext';
import { getApiUrl } from '@/lib/api/browser';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

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
}

const ORDER_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending', label: 'Placed' },
  { key: 'paid', label: 'Paid' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

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
            Track Your LUXE Order
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
      } catch (error) {
        setOrder(null);
        setErrorMsg(error instanceof Error ? error.message : 'Unable to track your order.');
      } finally {
        setLoading(false);
      }
    },
    [email, reference, user?.email]
  );

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
            Track Your LUXE Order
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
                  placeholder="e.g. 67f5... or LUXE-AB12CD34"
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
                Shipment emails are sent to the address used at checkout once the admin marks your order as shipped.
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
