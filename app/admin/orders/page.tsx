'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  totalItems: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customer: Customer;
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });

    if (!response.ok) {
      return;
    }

    void fetchOrders();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-semibold uppercase tracking-widest text-theme-walnut/50 dark:text-theme-ivory/50">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8 flex items-center justify-between">
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
            <div
              key={order._id}
              className="overflow-hidden rounded-2xl border border-theme-line/40 bg-white/70 shadow-sm dark:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-4 p-5">
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
                <div className="text-right">
                  <p className="font-bold text-theme-bronze">
                    Rs. {order.totalPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/50">
                    {order.totalItems} items
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] ?? ''}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div>
                  <select
                    value={order.status}
                    onChange={(event) => updateStatus(order._id, event.target.value)}
                    className="rounded-lg border border-theme-line/60 bg-white px-3 py-1.5 text-xs font-semibold text-theme-ink outline-none focus:border-theme-bronze dark:bg-theme-ink dark:text-theme-ivory"
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
                  className="text-xs font-semibold uppercase tracking-widest text-theme-bronze hover:underline"
                >
                  {expandedId === order._id ? 'Hide' : 'Details'}
                </button>
              </div>

              {expandedId === order._id ? (
                <div className="border-t border-theme-line/40 bg-theme-ivory/50 px-5 py-4 dark:bg-white/5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">
                        Delivery Address
                      </p>
                      <p className="text-sm text-theme-ink dark:text-theme-ivory">
                        {order.customer?.address}, {order.customer?.city} - {order.customer?.pincode}
                      </p>
                      {order.notes ? (
                        <p className="mt-2 text-xs italic text-theme-walnut/60 dark:text-theme-ivory/50">
                          Notes: {order.notes}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-theme-bronze">
                        Items
                      </p>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-theme-ink dark:text-theme-ivory">
                              {item.name} x {item.quantity}
                            </span>
                            <span className="font-semibold text-theme-walnut/80 dark:text-theme-ivory/80">
                              Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
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

