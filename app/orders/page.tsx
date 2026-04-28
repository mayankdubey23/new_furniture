'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AnimatedHeading from '@/components/AnimatedHeading';
import { useUser } from '@/context/UserContext';
import { getApiUrl } from '@/lib/api/browser';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';
type PaymentMethod = 'cod' | 'razorpay';
type PaymentStatus = 'pending' | 'paid' | 'failed';
type RequestStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded' | 'closed';
type RequestType = 'return' | 'refund' | 'exchange' | 'return-refund';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ReturnRequest {
  _id?: string;
  requestType: RequestType;
  status: RequestStatus;
  reason: string;
  requestedAt: string;
}

interface UserOrder {
  _id: string;
  trackingNumber?: string;
  totalPrice: number;
  totalItems: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  returnRefundRequests?: ReturnRequest[];
}

function formatDate(value?: string) {
  if (!value) return 'Pending update';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatStatus(value?: string) {
  return String(value || 'pending')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case 'delivered':
      return 'border-emerald-300/70 bg-emerald-50 text-emerald-700';
    case 'shipped':
      return 'border-blue-300/70 bg-blue-50 text-blue-700';
    case 'paid':
      return 'border-violet-300/70 bg-violet-50 text-violet-700';
    default:
      return 'border-amber-300/70 bg-amber-50 text-amber-700';
  }
}

function getLatestRequest(order: UserOrder) {
  const requests = Array.isArray(order.returnRefundRequests) ? order.returnRefundRequests : [];
  return requests
    .slice()
    .sort((left, right) => new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime())[0];
}

export default function OrdersPage() {
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/orders/current'), {
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = (await response.json()) as { orders?: UserOrder[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to load your orders.');
      }

      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setOrders([]);
      setLoading(false);
      setError('');
      return;
    }

    void loadOrders();
  }, [loadOrders, user, userLoading]);

  const orderCountLabel = useMemo(() => {
    if (orders.length === 1) return '1 order';
    return `${orders.length} orders`;
  }, [orders.length]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">My Orders</p>
            <AnimatedHeading as="h1" className="mt-3 font-display text-5xl text-theme-ink dark:text-theme-ivory md:text-6xl">
              Order history
            </AnimatedHeading>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/64">
              Review previous purchases, track delivery progress, and open a return, refund, or exchange request for eligible orders.
            </p>
          </div>
          {user ? (
            <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/58 px-5 py-4 text-sm dark:bg-white/5">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">Signed in as</p>
              <p className="mt-2 font-semibold text-theme-ink dark:text-theme-ivory">{user.email}</p>
            </div>
          ) : null}
        </div>

        {!userLoading && !user ? (
          <section className="section-shell rounded-[2rem] border border-theme-line/50 p-8 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">Account Required</p>
            <AnimatedHeading as="h2" className="mt-4 font-display text-4xl text-theme-ink dark:text-theme-ivory">
              Sign in to see your orders
            </AnimatedHeading>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">
              Your order history is matched with the email on your account.
            </p>
            <Link href="/login" className="mt-7 inline-flex rounded-full bg-theme-bronze px-8 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-ink">
              Sign In
            </Link>
          </section>
        ) : (
          <section className="section-shell rounded-[2rem] border border-theme-line/50 p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">History</p>
                <p className="mt-2 text-sm text-theme-walnut/62 dark:text-theme-ivory/58">
                  {loading ? 'Loading your orders...' : orderCountLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadOrders()}
                disabled={loading || !user}
                className="rounded-full border border-theme-line/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-theme-walnut transition hover:border-theme-bronze hover:text-theme-bronze disabled:opacity-50 dark:text-theme-ivory/70"
              >
                Refresh
              </button>
            </div>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            ) : null}

            {!loading && !error && !orders.length ? (
              <div className="mt-8 rounded-[1.8rem] border border-theme-line/45 bg-white/50 px-6 py-14 text-center dark:bg-white/5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">No Orders Yet</p>
                <AnimatedHeading as="h2" className="mt-4 font-display text-4xl text-theme-ink dark:text-theme-ivory">
                  Your history is empty
                </AnimatedHeading>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">
                  Orders placed with {user?.email || 'this account'} will appear here.
                </p>
                <Link href="/" className="mt-7 inline-flex rounded-full bg-theme-bronze px-8 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-ink">
                  Browse Products
                </Link>
              </div>
            ) : null}

            <div className="mt-7 grid gap-5">
              {orders.map((order) => {
                const latestRequest = getLatestRequest(order);
                const trackHref = `/track-order?orderId=${encodeURIComponent(order._id)}`;

                return (
                  <article key={order._id} className="rounded-[1.7rem] border border-theme-line/50 bg-white/58 p-5 dark:bg-white/5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                          {order.trackingNumber || 'Tracking pending'}
                        </p>
                        <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
                          Rs. {Number(order.totalPrice || 0).toLocaleString('en-IN')}
                        </h2>
                        <p className="mt-2 text-sm text-theme-walnut/62 dark:text-theme-ivory/58">
                          Placed {formatDate(order.createdAt)} | {order.totalItems} item{order.totalItems === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${statusClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_240px]">
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={`${order._id}-${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-theme-line/40 bg-theme-ivory/58 px-4 py-3 dark:bg-white/5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-theme-ink dark:text-theme-ivory">{item.name}</p>
                              <p className="mt-1 text-xs text-theme-walnut/58 dark:text-theme-ivory/56">Qty: {item.quantity}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-theme-bronze">
                              Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                        {order.items.length > 3 ? (
                          <p className="px-2 text-xs text-theme-walnut/54 dark:text-theme-ivory/50">
                            +{order.items.length - 3} more item{order.items.length - 3 === 1 ? '' : 's'}
                          </p>
                        ) : null}
                      </div>

                      <div className="rounded-[1.25rem] border border-theme-line/40 bg-theme-ivory/58 p-4 text-sm dark:bg-white/5">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-theme-bronze">Payment</p>
                        <p className="mt-2 text-theme-ink dark:text-theme-ivory">
                          {order.paymentMethod === 'razorpay' ? 'Online payment' : 'Cash on Delivery'}
                        </p>
                        <p className="mt-1 text-theme-walnut/58 dark:text-theme-ivory/56">
                          {formatStatus(order.paymentStatus)}
                        </p>
                        <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-theme-bronze">Delivery</p>
                        <p className="mt-2 text-theme-walnut/64 dark:text-theme-ivory/58">
                          {formatDate(order.estimatedDelivery)}
                        </p>
                      </div>
                    </div>

                    {latestRequest ? (
                      <div className="mt-5 rounded-[1.15rem] border border-theme-line/40 bg-theme-ivory/58 px-4 py-3 text-sm dark:bg-white/5">
                        <span className="font-semibold text-theme-ink dark:text-theme-ivory">
                          Latest service request:
                        </span>{' '}
                        <span className="text-theme-walnut/64 dark:text-theme-ivory/58">
                          {formatStatus(latestRequest.requestType)} - {formatStatus(latestRequest.status)}
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={trackHref} className="rounded-full bg-theme-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-theme-bronze">
                        Track Order
                      </Link>
                      <Link href={trackHref} className="rounded-full border border-theme-line/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-theme-walnut transition hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70">
                        Return / Refund / Exchange
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
