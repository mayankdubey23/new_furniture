'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  Wallet,
} from 'lucide-react';
import StorefrontContentStudio from '@/components/admin/StorefrontContentStudio';
import { getApiUrl } from '@/lib/api/browser';
import { getAdminPortalPath } from '@/lib/adminPortal';
import {
  DEFAULT_ADMIN_SETTINGS,
  normalizeAdminSettings,
  type AdminSettingsState,
} from '@/lib/adminSettings';
import { ADMIN_TOAST_EVENT, type AdminToastDetail, emitAdminToast } from '@/lib/adminNotifications';
import {
  AdminOrder,
  AdminProduct,
  deriveCustomers,
  deriveRevenueSeries,
  deriveTopProducts,
  downloadCsv,
  downloadPdf,
  formatCurrency,
} from '@/lib/adminDashboard';
import { PAYMENT_RECEIPT_PREFIX } from '@/lib/brand';
import { announceStorefrontUpdate } from '@/lib/storefrontSync';

const adminProductsHref = getAdminPortalPath('/products');
const adminCustomersHref = getAdminPortalPath('/customers');
const adminContentHref = getAdminPortalPath('/content');
const adminOrdersHref = getAdminPortalPath('/orders');
const adminCustomizationsHref = getAdminPortalPath('/customizations');

function SectionShell({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">{title}</h2>
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.8rem] border border-theme-line/60 bg-white/72 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.06)] dark:bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">{label}</p>
        <div className="rounded-2xl border border-theme-line/60 bg-theme-ink p-2 text-white dark:bg-white dark:text-[var(--theme-contrast-ink)]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-6 font-display text-3xl text-theme-ink dark:text-theme-ivory sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">{note}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [settings, setSettings] = useState<AdminSettingsState>(DEFAULT_ADMIN_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [toast, setToast] = useState<AdminToastDetail | null>(null);

  const refreshDashboard = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [productsRes, ordersRes, settingsRes] = await Promise.all([
        fetch(getApiUrl('/api/products'), { cache: 'no-store' }),
        fetch(getApiUrl('/api/orders'), { credentials: 'include', cache: 'no-store' }),
        fetch(getApiUrl('/api/admin/settings'), { credentials: 'include', cache: 'no-store' }),
      ]);

      const [productData, orderData, settingsData] = await Promise.all([
        productsRes.json(),
        ordersRes.ok ? ordersRes.json() : [],
        settingsRes.ok ? settingsRes.json() : DEFAULT_ADMIN_SETTINGS,
      ]);

      setProducts(Array.isArray(productData) ? productData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setSettings(normalizeAdminSettings(settingsData));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<AdminToastDetail>;
      setToast(customEvent.detail);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setToast(null);
      }, 3200);
    };

    window.addEventListener(ADMIN_TOAST_EVENT, handleToast as EventListener);

    return () => {
      window.removeEventListener(ADMIN_TOAST_EVENT, handleToast as EventListener);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const customers = useMemo(() => deriveCustomers(orders), [orders]);
  const topProducts = useMemo(() => deriveTopProducts(orders).slice(0, 5), [orders]);
  const revenueSeries = useMemo(() => deriveRevenueSeries(orders, 6), [orders]);
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.totalPrice, 0), [orders]);
  const totalUnits = useMemo(() => products.reduce((sum, product) => sum + (product.stock ?? 0), 0), [products]);
  const lowStockProducts = useMemo(() => products.filter((product) => (product.stock ?? 0) <= 5), [products]);
  const pendingOrders = useMemo(() => orders.filter((order) => order.status === 'pending').length, [orders]);
  const maxRevenue = Math.max(...revenueSeries.map((entry) => entry.revenue), 1);
  const orderExportRows = useMemo(
    () =>
      orders.map((order) => ({
        customer: order.customer.name,
        email: order.customer.email,
        total: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
      })),
    [orders]
  );
  const customerExportRows = useMemo(
    () =>
      customers.map((customer) => ({
        name: customer.name,
        email: customer.email,
        city: customer.city,
        orders: customer.orders,
        spent: customer.spent,
        favoriteProduct: customer.favoriteProduct,
      })),
    [customers]
  );

  const handleSaveSettings = async (nextSettings: AdminSettingsState = settings) => {
    setSavingSettings(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(nextSettings),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save storefront settings.');
      }

      const normalizedSettings = normalizeAdminSettings(data);
      setSettings(normalizedSettings);
      await refreshDashboard(true);
      announceStorefrontUpdate('admin-settings');
      emitAdminToast({
        type: 'success',
        message: 'Settings saved successfully. Storefront is updating now.',
      });
      return normalizedSettings;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save storefront settings.';

      emitAdminToast({
        type: 'error',
        message,
      });
      throw error;
    } finally {
      setSavingSettings(false);
    }
  };

  const handleHoverPdfExport = useCallback((kind: 'orders' | 'customers') => {
    const isOrders = kind === 'orders';
    const rows = isOrders ? orderExportRows : customerExportRows;

    if (!rows.length) {
      setExportStatus(`No ${kind} record found.`);
      return;
    }

    downloadPdf(
      `${PAYMENT_RECEIPT_PREFIX}-${kind}.pdf`,
      isOrders ? 'Orders Export' : 'Customers Export',
      rows
    );
    setExportStatus(`${isOrders ? 'Orders' : 'Customers'} PDF downloaded.`);
  }, [customerExportRows, orderExportRows]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-theme-walnut/56 dark:text-theme-ivory/56">Curating Dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {toast ? (
        <div className="fixed left-3 right-3 top-4 z-[90] sm:left-auto sm:right-6 sm:top-6 sm:max-w-sm">
          <div className={`rounded-[1.4rem] border px-4 py-3 shadow-[0_20px_50px_rgba(49,30,21,0.16)] backdrop-blur ${
            toast.type === 'success'
              ? 'border-emerald-300/50 bg-emerald-50/95 text-emerald-800'
              : 'border-red-300/50 bg-red-50/95 text-red-700'
          }`}>
            <div className="flex items-start gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p className="text-sm font-semibold leading-6">{toast.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2.5rem] border border-theme-line/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(244,232,215,0.8))] p-6 shadow-[0_26px_90px_rgba(49,30,21,0.1)] dark:bg-[linear-gradient(135deg,rgba(54,40,33,0.52),rgba(24,18,15,0.8))] md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.36em] text-theme-bronze">Minimal Luxury Operations</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-theme-ink dark:text-theme-ivory sm:text-4xl md:text-6xl">A calm control center for products, customers, and storefront flow.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-theme-walnut/72 dark:text-theme-ivory/66 md:text-base">Monitor revenue, update catalogue details, manage orders, and toggle maintenance controls with a cleaner luxury interface.</p>
            {refreshing ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/72 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-theme-walnut/66 dark:bg-white/5 dark:text-theme-ivory/64">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-theme-bronze" />
                Syncing latest admin changes
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.8rem] border border-theme-line/60 bg-white/76 p-5 dark:bg-white/5">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">Quick Exports</p>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onMouseEnter={() => handleHoverPdfExport('orders')}
                  onClick={() => {
                    if (!orderExportRows.length) {
                      setExportStatus('No orders record found.');
                      return;
                    }
                    downloadCsv(`${PAYMENT_RECEIPT_PREFIX}-orders.csv`, orderExportRows);
                    setExportStatus('Orders CSV downloaded.');
                  }}
                  className="inline-flex items-center justify-between rounded-full border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm font-semibold transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/6"
                >
                  Orders <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseEnter={() => handleHoverPdfExport('customers')}
                  onClick={() => {
                    if (!customerExportRows.length) {
                      setExportStatus('No customers record found.');
                      return;
                    }
                    downloadCsv(`${PAYMENT_RECEIPT_PREFIX}-customers.csv`, customerExportRows);
                    setExportStatus('Customers CSV downloaded.');
                  }}
                  className="inline-flex items-center justify-between rounded-full border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm font-semibold transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/6"
                >
                  Customers <Download className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-6 text-theme-walnut/58 dark:text-theme-ivory/56">
                {exportStatus || 'Hover a card to auto-download the PDF report. Click to download CSV.'}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-theme-line/60 bg-theme-ink p-5 text-theme-ivory shadow-[0_18px_48px_rgba(26,22,19,0.16)] dark:bg-white dark:text-[var(--theme-contrast-ink)]">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">Operational Status</p>
              <div className="mt-4 space-y-3 text-sm leading-7">
                <p>{pendingOrders} pending order{pendingOrders !== 1 ? 's' : ''} awaiting review.</p>
                <p>{lowStockProducts.length} low-stock alert{lowStockProducts.length !== 1 ? 's' : ''} currently active.</p>
                <p>{settings.maintenanceMode ? 'Maintenance redirect is active.' : 'Storefront is open to visitors.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Total Products" value={String(products.length)} note={`${totalUnits} units across the collection`} icon={Boxes} />
        <StatCard label="Total Orders" value={String(orders.length)} note={`${pendingOrders} currently awaiting action`} icon={ClipboardList} />
        <StatCard label="Customers" value={String(customers.length)} note="Derived from live order history" icon={Users} />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} note="All-time tracked order value" icon={Wallet} />
      </div>

      <SectionShell eyebrow="Workspace Shortcuts" title="Jump Into Daily Admin Tasks">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            {
              href: adminProductsHref,
              title: 'Product Studio',
              description: 'Update catalogue media, prices, stock, and linked collections.',
              icon: Boxes,
            },
            {
              href: adminCustomersHref,
              title: 'Customer Records',
              description: 'Review buyer accounts, roles, and account status in one place.',
              icon: Users,
            },
            {
              href: adminContentHref,
              title: 'Content Control',
              description: 'Manage FAQs, features, testimonials, newsletters, and inbox data.',
              icon: FileText,
            },
            {
              href: adminCustomizationsHref,
              title: 'Customization Desk',
              description: 'Follow up on made-to-order requests and move them through review.',
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[1.6rem] border border-theme-line/50 bg-white/74 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] transition hover:-translate-y-1 hover:border-theme-bronze/40 hover:shadow-[0_26px_60px_rgba(49,30,21,0.1)] dark:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl border border-theme-line/60 bg-theme-ink p-2 text-white transition group-hover:bg-theme-bronze dark:bg-white dark:text-[var(--theme-contrast-ink)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-theme-bronze transition group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-theme-ink dark:text-theme-ivory">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </SectionShell>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionShell eyebrow="Analytics Graph" title="Revenue Pulse" action={<div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/66 dark:bg-white/5 dark:text-theme-ivory/64 sm:w-auto"><BarChart3 className="h-3.5 w-3.5 text-theme-bronze" /> Last 6 Months</div>}>
          <div className="overflow-x-auto pb-2">
            <div className="flex h-[300px] min-w-[34rem] items-end gap-4 rounded-[1.6rem] border border-theme-line/50 bg-white/70 p-5 dark:bg-white/4">
              {revenueSeries.map((item) => (
                <div key={item.key} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-52 w-full items-end">
                    <div className="w-full rounded-t-[1.4rem] bg-[linear-gradient(180deg,var(--theme-bronze),#6a4734)]" style={{ height: `${Math.max((item.revenue / maxRevenue) * 100, 8)}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut/60 dark:text-theme-ivory/60">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-theme-ink dark:text-theme-ivory">{item.revenue ? formatCurrency(item.revenue) : 'No sales'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell eyebrow="Operations Feed" title="Recent Activity" action={<Link href={adminOrdersHref} className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64">Open Orders <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          <div className="space-y-4">
            <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/70 p-5 dark:bg-white/4">
              <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-theme-bronze" /><p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">Alerts</p></div>
              <div className="mt-4 space-y-3 text-sm">
                {settings.notifications.orderAlerts ? <div className="rounded-[1.2rem] border border-theme-line/50 bg-theme-ivory/60 px-4 py-3 dark:bg-white/5">{pendingOrders} pending order{pendingOrders !== 1 ? 's' : ''} need review.</div> : null}
                {settings.notifications.lowStockAlerts ? <div className="rounded-[1.2rem] border border-theme-line/50 bg-theme-ivory/60 px-4 py-3 dark:bg-white/5">{lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} at low stock.</div> : null}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/70 p-5 dark:bg-white/4">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">Top Products</p>
              <div className="mt-4 space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between gap-4">
                    <div><p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">{index + 1}. {product.name}</p><p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/56">{product.units} units sold</p></div>
                    <span className="text-sm font-semibold text-theme-bronze">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div>
        <SectionShell eyebrow="Behavior & Preferences" title="Customer Intelligence" action={<Link href={adminCustomersHref} className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64">Open Full Customers <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/4"><p className="text-xs uppercase tracking-[0.24em] text-theme-bronze">High Value</p><p className="mt-3 font-display text-3xl text-theme-ink dark:text-theme-ivory">{customers.filter((customer) => customer.spent >= 50000).length}</p></div>
            <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/4"><p className="text-xs uppercase tracking-[0.24em] text-theme-bronze">Repeat Buyers</p><p className="mt-3 font-display text-3xl text-theme-ink dark:text-theme-ivory">{customers.filter((customer) => customer.orders > 1).length}</p></div>
            <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/4"><p className="text-xs uppercase tracking-[0.24em] text-theme-bronze">Top City</p><p className="mt-3 font-display text-3xl text-theme-ink dark:text-theme-ivory">{customers[0]?.city || 'N/A'}</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {customers.slice(0, 6).map((customer) => (
              <div key={customer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-theme-line/50 bg-theme-ivory/62 px-4 py-4 dark:bg-white/5">
                <div><p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">{customer.name}</p><p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/56">{customer.email} | {customer.city}</p></div>
                <div className="grid w-full min-w-0 gap-2 sm:w-auto sm:grid-cols-3">
                  <div><p className="text-[0.65rem] uppercase tracking-[0.22em] text-theme-bronze">Orders</p><p className="mt-1 text-sm font-semibold">{customer.orders}</p></div>
                  <div><p className="text-[0.65rem] uppercase tracking-[0.22em] text-theme-bronze">Spent</p><p className="mt-1 text-sm font-semibold">{formatCurrency(customer.spent)}</p></div>
                  <div><p className="text-[0.65rem] uppercase tracking-[0.22em] text-theme-bronze">Preference</p><p className="mt-1 text-sm font-semibold">{customer.favoriteProduct}</p></div>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
        </div>

        <SectionShell eyebrow="Store Controls" title="Maintenance & Settings" action={<button onClick={() => { void handleSaveSettings().catch(() => undefined); }} disabled={savingSettings} className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)]">Save Controls</button>}>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/70 p-5 dark:bg-white/4">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                <div><p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">Maintenance Mode</p><h3 className="mt-2 text-lg font-semibold text-theme-ink dark:text-theme-ivory">Redirect storefront visitors</h3></div>
                <button type="button" onClick={() => setSettings((current) => ({ ...current, maintenanceMode: !current.maintenanceMode }))} className={`relative h-8 w-14 rounded-full transition ${settings.maintenanceMode ? 'bg-theme-bronze' : 'bg-theme-sand'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} /></button>
              </div>
              <textarea value={settings.maintenanceMessage} onChange={(event) => setSettings((current) => ({ ...current, maintenanceMessage: event.target.value }))} rows={4} className="mt-5 w-full rounded-[1.2rem] border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm outline-none focus:border-theme-bronze dark:bg-white/6" />
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut/64 dark:text-theme-ivory/64">
                {settings.maintenanceMode ? <><TriangleAlert className="h-3.5 w-3.5 text-theme-bronze" /> Maintenance is live</> : <><CheckCircle2 className="h-3.5 w-3.5 text-theme-bronze" /> Storefront is available</>}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/70 p-5 dark:bg-white/4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">Admin Profile</p>
              <div className="mt-5 space-y-4">
                <input value={settings.adminProfile.displayName} onChange={(event) => setSettings((current) => ({ ...current, adminProfile: { ...current.adminProfile, displayName: event.target.value } }))} className="w-full rounded-2xl border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm outline-none dark:bg-white/6" />
                <input value={settings.adminProfile.email} onChange={(event) => setSettings((current) => ({ ...current, adminProfile: { ...current.adminProfile, email: event.target.value } }))} className="w-full rounded-2xl border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm outline-none dark:bg-white/6" />
                <input value={settings.adminProfile.phone} onChange={(event) => setSettings((current) => ({ ...current, adminProfile: { ...current.adminProfile, phone: event.target.value } }))} placeholder="+91 98765 43210" className="w-full rounded-2xl border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm outline-none dark:bg-white/6" />
                <p className="text-xs leading-6 text-theme-walnut/58 dark:text-theme-ivory/54">
                  Admin password recovery uses this email and contact number after verification.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, orderAlerts: !current.notifications.orderAlerts } }))} className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-semibold transition ${settings.notifications.orderAlerts ? 'border-theme-bronze bg-theme-bronze/10 text-theme-bronze' : 'border-theme-line/60 bg-white/70 text-theme-walnut/70 dark:bg-white/6 dark:text-theme-ivory/64'}`}>Order alerts</button>
                  <button type="button" onClick={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, lowStockAlerts: !current.notifications.lowStockAlerts } }))} className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-semibold transition ${settings.notifications.lowStockAlerts ? 'border-theme-bronze bg-theme-bronze/10 text-theme-bronze' : 'border-theme-line/60 bg-white/70 text-theme-walnut/70 dark:bg-white/6 dark:text-theme-ivory/64'}`}>Low stock alerts</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[{ label: 'Role Based Access', value: 'Admin', icon: ShieldCheck }, { label: 'Security Model', value: 'Verified Recovery', icon: Settings2 }, { label: 'Experience Mode', value: 'Luxury UI', icon: Sparkles }].map((item) => {
              const Icon = item.icon;
              return <div key={item.label} className="rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/62 p-4 dark:bg-white/5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-theme-ink p-2 text-white dark:bg-white dark:text-[var(--theme-contrast-ink)]"><Icon className="h-4 w-4" /></div><div><p className="text-[0.66rem] uppercase tracking-[0.24em] text-theme-bronze">{item.label}</p><p className="mt-1 text-sm font-semibold text-theme-ink dark:text-theme-ivory">{item.value}</p></div></div></div>;
            })}
          </div>
        </SectionShell>
      </div>

      <SectionShell eyebrow="Store Operations" title="Order Management" action={<Link href={adminOrdersHref} className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-bronze dark:bg-white dark:text-[var(--theme-contrast-ink)]">Open Full Orders <ArrowRight className="h-3.5 w-3.5" /></Link>}>
        <div className="grid gap-4 lg:grid-cols-3">
          {orders.slice(0, 3).map((order) => (
            <div key={order._id} className="rounded-[1.6rem] border border-theme-line/50 bg-white/72 p-5 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">{order.status}</p><p className="mt-2 text-base font-semibold text-theme-ink dark:text-theme-ivory">{order.customer.name}</p></div><Wallet className="h-5 w-5 text-theme-bronze" /></div>
              <p className="mt-4 text-2xl font-display text-theme-ink dark:text-theme-ivory">{formatCurrency(order.totalPrice)}</p>
              <p className="mt-2 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">{order.totalItems} items | {order.customer.city}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <StorefrontContentStudio
        settings={settings}
        setSettings={setSettings}
        onSave={handleSaveSettings}
        saving={savingSettings}
      />
    </div>
  );
}
