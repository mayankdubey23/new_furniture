'use client';

import { useEffect, useState } from 'react';
import { getCountryOption } from '@/lib/addressDirectory';
import { getApiUrl } from '@/lib/api/browser';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

type ReturnRefundRequestType = 'return' | 'refund' | 'exchange' | 'return-refund';
type ReturnRefundRequestStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'refunded'
  | 'closed';

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

interface Customer {
  name: string;
  email: string;
  phone: string;
  country?: string;
  state?: string;
  addressLine1?: string;
  addressLine2?: string;
  address: string;
  city: string;
  pincode: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  totalItems: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  trackingNumber?: string;
  estimatedDelivery?: string;
  paymentMethod?: 'cod' | 'razorpay';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
  items: OrderItem[];
  statusTimeline?: Array<{
    status: 'pending' | 'paid' | 'shipped' | 'delivered';
    title: string;
    message: string;
    createdAt: string;
  }>;
  customer: Customer;
  notes?: string;
  returnRefundRequests?: ReturnRefundRequest[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  razorpay: 'Razorpay',
};

const REQUEST_STATUS_COLORS: Record<ReturnRefundRequestStatus, string> = {
  requested: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  received: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  refunded: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  closed: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
};

const REQUEST_STATUS_OPTIONS: ReturnRefundRequestStatus[] = [
  'requested',
  'approved',
  'received',
  'refunded',
  'rejected',
  'closed',
];

function getRequestTypeLabel(value: ReturnRefundRequestType) {
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
      return value;
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [requestEdits, setRequestEdits] = useState<
    Record<string, { status: ReturnRefundRequestStatus; adminNotes: string; refundAmount: string }>
  >({});
  const [savingRequestKey, setSavingRequestKey] = useState<string | null>(null);

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(getApiUrl('/api/orders'), { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      setOrders((await response.json()) as Order[]);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    const response = await fetch(getApiUrl(`/api/orders/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });

    if (response.ok) {
      void fetchOrders();
    }
  };

  const updateRequestEdit = (
    requestId: string,
    patch: Partial<{ status: ReturnRefundRequestStatus; adminNotes: string; refundAmount: string }>
  ) => {
    setRequestEdits((current) => ({
      ...current,
      [requestId]: {
        status: current[requestId]?.status || 'requested',
        adminNotes: current[requestId]?.adminNotes || '',
        refundAmount: current[requestId]?.refundAmount || '',
        ...patch,
      },
    }));
  };

  const saveReturnRequest = async (orderId: string, request: ReturnRefundRequest) => {
    const edit = requestEdits[request._id] || {
      status: request.status,
      adminNotes: request.adminNotes || '',
      refundAmount:
        typeof request.refundAmount === 'number' ? String(request.refundAmount) : '',
    };

    setSavingRequestKey(request._id);
    try {
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/returns`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          requestId: request._id,
          status: edit.status,
          adminNotes: edit.adminNotes,
          refundAmount: edit.refundAmount ? Number(edit.refundAmount) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update return/refund request.');
      }

      await fetchOrders();
    } catch {
      // Keep the current inline state; the admin can retry immediately.
    } finally {
      setSavingRequestKey(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-semibold uppercase tracking-widest text-theme-walnut/50 dark:text-theme-ivory/50">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
        <h1 className="text-2xl font-bold text-theme-ink dark:text-theme-ivory">Orders</h1>
        <span className="rounded-full bg-theme-bronze/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-theme-bronze">
          {orders.length} total
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-theme-line/40 bg-white/60 p-12 text-center dark:bg-white/5">
          <p className="text-sm text-theme-walnut/60 dark:text-theme-ivory/50">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="overflow-hidden rounded-2xl border border-theme-line/40 bg-white/70 shadow-sm dark:bg-white/5">
              <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:flex-wrap lg:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-theme-walnut/50 dark:text-theme-ivory/40">
                    #{order._id.slice(-10).toUpperCase()}
                  </p>
                  <p className="mt-0.5 font-semibold text-theme-ink dark:text-white">
                    {order.customer?.name ?? 'Guest'}
                  </p>
                  <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/50">
                    {order.customer?.email} | {order.customer?.phone}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-bold text-theme-bronze">Rs. {order.totalPrice.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/50">{order.totalItems} items</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] ?? ''}`}>
                    {order.status}
                  </span>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${PAYMENT_STATUS_COLORS[order.paymentStatus || 'pending'] ?? PAYMENT_STATUS_COLORS.pending}`}>
                    payment {order.paymentStatus || 'pending'}
                  </span>
                </div>

                <div className="w-full sm:w-auto sm:min-w-[11rem]">
                  <select
                    value={order.status}
                    onChange={(event) => void updateStatus(order._id, event.target.value as Order['status'])}
                    className="w-full rounded-lg border border-theme-line/60 bg-white px-3 py-1.5 text-xs font-semibold text-theme-ink outline-none focus:border-theme-bronze dark:bg-theme-ink dark:text-theme-ivory"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div className="text-xs text-theme-walnut/50 dark:text-theme-ivory/40">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>

                <button
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  className="self-start text-xs font-semibold uppercase tracking-widest text-theme-bronze hover:underline sm:self-auto"
                >
                  {expandedId === order._id ? 'Hide' : 'Details'}
                </button>
              </div>

              {expandedId === order._id ? (
                <div className="border-t border-theme-line/40 bg-theme-ivory/50 px-4 py-4 dark:bg-white/5 sm:px-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">Delivery Address</p>
                        <p className="text-sm text-theme-ink dark:text-theme-ivory">
                          {order.customer?.addressLine1 || order.customer?.address}
                          {order.customer?.addressLine2 ? `, ${order.customer.addressLine2}` : ''}
                        </p>
                        <p className="mt-1 text-sm text-theme-ink dark:text-theme-ivory">
                          {order.customer?.city}
                          {order.customer?.state ? `, ${order.customer.state}` : ''}
                          {' - '}
                          {order.customer?.pincode}
                          {order.customer?.country
                            ? `, ${getCountryOption(order.customer.country)?.name || order.customer.country}`
                            : ''}
                        </p>
                        {order.notes ? (
                          <p className="mt-2 text-xs italic text-theme-walnut/60 dark:text-theme-ivory/50">
                            Notes: {order.notes}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">Payment</p>
                        <div className="space-y-1 text-sm text-theme-ink dark:text-theme-ivory">
                          <p>Method: {PAYMENT_LABELS[order.paymentMethod || 'cod'] || 'Cash on Delivery'}</p>
                          <p>Status: {order.paymentStatus || 'pending'}</p>
                          {order.paidAt ? <p>Paid on: {new Date(order.paidAt).toLocaleString('en-IN')}</p> : null}
                          {order.gatewayOrderId ? <p className="break-all text-xs">Gateway order: {order.gatewayOrderId}</p> : null}
                          {order.gatewayPaymentId ? <p className="break-all text-xs">Gateway payment: {order.gatewayPaymentId}</p> : null}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">Tracking</p>
                        <div className="space-y-1 text-sm text-theme-ink dark:text-theme-ivory">
                          <p>Tracking number: {order.trackingNumber || 'Auto-generated when shipment starts'}</p>
                          <p>
                            Estimated delivery:{' '}
                            {order.estimatedDelivery
                              ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Will be assigned after shipping'}
                          </p>
                          <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/50">
                            When this order changes to shipped, the customer gets both an email and a website notification.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">Items</p>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                            <span className="text-theme-ink dark:text-theme-ivory">
                              {item.name} x {item.quantity}
                            </span>
                            <span className="font-semibold text-theme-walnut/80 dark:text-theme-ivory/80">
                              Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.statusTimeline?.length ? (
                        <div className="mt-6">
                          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">Status Timeline</p>
                          <div className="space-y-2">
                            {[...order.statusTimeline]
                              .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
                              .map((entry) => (
                                <div key={`${entry.status}-${entry.createdAt}`} className="rounded-xl border border-theme-line/40 bg-white/60 px-3 py-3 text-sm dark:bg-white/5">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-theme-bronze">{entry.status}</p>
                                      <p className="mt-1 font-semibold text-theme-ink dark:text-theme-ivory">{entry.title}</p>
                                    </div>
                                    <p className="text-xs text-theme-walnut/50 dark:text-theme-ivory/45">
                                      {new Date(entry.createdAt).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                  <p className="mt-2 text-theme-walnut/72 dark:text-theme-ivory/62">{entry.message}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}

                      {order.returnRefundRequests?.length ? (
                        <div className="mt-6">
                          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">
                            Return & Refund Requests
                          </p>
                          <div className="space-y-3">
                            {[...order.returnRefundRequests]
                              .sort(
                                (left, right) =>
                                  new Date(right.requestedAt).getTime() -
                                  new Date(left.requestedAt).getTime()
                              )
                              .map((request) => {
                                const requestEdit = requestEdits[request._id] || {
                                  status: request.status,
                                  adminNotes: request.adminNotes || '',
                                  refundAmount:
                                    typeof request.refundAmount === 'number'
                                      ? String(request.refundAmount)
                                      : '',
                                };

                                return (
                                  <div
                                    key={request._id}
                                    className="rounded-xl border border-theme-line/40 bg-white/60 px-3 py-3 text-sm dark:bg-white/5"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div>
                                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-theme-bronze">
                                          {getRequestTypeLabel(request.requestType)}
                                        </p>
                                        <p className="mt-1 font-semibold text-theme-ink dark:text-theme-ivory">
                                          {request.reason}
                                        </p>
                                      </div>
                                      <span
                                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${REQUEST_STATUS_COLORS[request.status]}`}
                                      >
                                        {request.status}
                                      </span>
                                    </div>

                                    <p className="mt-2 text-theme-walnut/72 dark:text-theme-ivory/62">
                                      {request.details}
                                    </p>
                                    <p className="mt-2 text-xs text-theme-walnut/50 dark:text-theme-ivory/45">
                                      Requested on {new Date(request.requestedAt).toLocaleString('en-IN')} by{' '}
                                      {request.customerEmail}
                                    </p>

                                    {request.items?.length ? (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {request.items.map((item) => (
                                          <span
                                            key={`${request._id}-${item.itemIndex}`}
                                            className="rounded-full border border-theme-line/40 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-theme-walnut/64 dark:text-theme-ivory/58"
                                          >
                                            {item.name} x {item.quantity}
                                          </span>
                                        ))}
                                      </div>
                                    ) : null}

                                    <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_160px_auto]">
                                      <select
                                        value={requestEdit.status}
                                        onChange={(event) =>
                                          updateRequestEdit(request._id, {
                                            status: event.target.value as ReturnRefundRequestStatus,
                                          })
                                        }
                                        className="rounded-lg border border-theme-line/60 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink outline-none focus:border-theme-bronze dark:bg-theme-ink dark:text-theme-ivory"
                                      >
                                        {REQUEST_STATUS_OPTIONS.map((status) => (
                                          <option key={status} value={status}>
                                            {status}
                                          </option>
                                        ))}
                                      </select>
                                      <textarea
                                        rows={3}
                                        value={requestEdit.adminNotes}
                                        onChange={(event) =>
                                          updateRequestEdit(request._id, {
                                            adminNotes: event.target.value.slice(0, 1200),
                                          })
                                        }
                                        placeholder="Admin notes for the customer or internal team"
                                        className="rounded-xl border border-theme-line/60 bg-white px-3 py-2 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:bg-theme-ink dark:text-theme-ivory"
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={requestEdit.refundAmount}
                                        onChange={(event) =>
                                          updateRequestEdit(request._id, {
                                            refundAmount: event.target.value,
                                          })
                                        }
                                        placeholder="Refund amount"
                                        className="rounded-lg border border-theme-line/60 bg-white px-3 py-2 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:bg-theme-ink dark:text-theme-ivory"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => void saveReturnRequest(order._id, request)}
                                        disabled={savingRequestKey === request._id}
                                        className="rounded-full bg-theme-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-theme-bronze disabled:opacity-50"
                                      >
                                        {savingRequestKey === request._id ? 'Saving' : 'Update'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
