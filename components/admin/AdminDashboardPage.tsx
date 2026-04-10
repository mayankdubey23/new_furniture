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
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  Wallet,
} from 'lucide-react';
import CatalogCollectionsStudio from '@/components/admin/CatalogCollectionsStudio';
import ProductStudio from '@/components/admin/ProductStudio';
import type { CatalogOptionsResponse } from '@/lib/catalogEntities';
import { getApiUrl } from '@/lib/api/browser';
import {
  AdminOrder,
  AdminProduct,
  AdminSettingsState,
  deriveCustomers,
  deriveRevenueSeries,
  deriveTopProducts,
  downloadCsv,
  formatCurrency,
} from '@/lib/adminDashboard';

const defaultSettings: AdminSettingsState = {
  maintenanceMode: false,
  maintenanceMessage: 'Website is under maintenance. Please visit later.',
  notifications: {
    orderAlerts: true,
    lowStockAlerts: true,
  },
  adminProfile: {
    displayName: 'LUXE Administrator',
    email: 'admin@luxe.local',
  },
};

const defaultCatalogOptions: CatalogOptionsResponse = {
  mainCategories: [],
  subCategories: [],
  brands: [],
};

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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">{title}</h2>
        </div>
        {action}
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
      <p className="mt-6 font-display text-4xl text-theme-ink dark:text-theme-ivory">{value}</p>
      <p className="mt-2 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">{note}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const [catalogOptions, setCatalogOptions] = useState<CatalogOptionsResponse>(defaultCatalogOptions);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, settingsRes, catalogRes] = await Promise.all([
        fetch(getApiUrl('/api/products'), { cache: 'no-store' }),
        fetch(getApiUrl('/api/orders'), { credentials: 'include', cache: 'no-store' }),
        fetch(getApiUrl('/api/admin/settings'), { cache: 'no-store' }),
        fetch(getApiUrl('/api/admin/catalog-options'), { cache: 'no-store' }),
      ]);

      const [productData, orderData, settingsData, catalogData] = await Promise.all([
        productsRes.json(),
        ordersRes.ok ? ordersRes.json() : [],
        settingsRes.ok ? settingsRes.json() : defaultSettings,
        catalogRes.ok ? catalogRes.json() : defaultCatalogOptions,
      ]);

      setProducts(Array.isArray(productData) ? productData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setSettings(settingsData?.maintenanceMessage ? settingsData : defaultSettings);
      setCatalogOptions(catalogData?.mainCategories ? catalogData : defaultCatalogOptions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const customers = useMemo(() => deriveCustomers(orders), [orders]);
  const topProducts = useMemo(() => deriveTopProducts(orders).slice(0, 5), [orders]);
  const revenueSeries = useMemo(() => deriveRevenueSeries(orders, 6), [orders]);
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.totalPrice, 0), [orders]);
  const totalUnits = useMemo(() => products.reduce((sum, product) => sum + (product.stock ?? 0), 0), [products]);
  const lowStockProducts = useMemo(() => products.filter((product) => (product.stock ?? 0) <= 5), [products]);
  const pendingOrders = useMemo(() => orders.filter((order) => order.status === 'pending').length, [orders]);
  const maxRevenue = Math.max(...revenueSeries.map((entry) => entry.revenue), 1);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const response = await fetch(getApiUrl('/api/admin/settings'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    if (response.ok) {
      setSettings(await response.json());
    }
    setSavingSettings(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-theme-walnut/56 dark:text-theme-ivory/56">Curating Dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-[2.5rem] border border-theme-line/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(244,232,215,0.8))] p-6 shadow-[0_26px_90px_rgba(49,30,21,0.1)] dark:bg-[linear-gradient(135deg,rgba(54,40,33,0.52),rgba(24,18,15,0.8))] md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.36em] text-theme-bronze">Minimal Luxury Operations</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-theme-ink dark:text-theme-ivory md:text-6xl">A calm control center for products, customers, and storefront flow.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-theme-walnut/72 dark:text-theme-ivory/66 md:text-base">Monitor revenue, update catalogue details, manage orders, and toggle maintenance controls with a cleaner luxury interface.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.8rem] border border-theme-line/60 bg-white/76 p-5 dark:bg-white/5">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">Quick Exports</p>
              <div className="mt-4 grid gap-3">
                <button onClick={() => downloadCsv('luxe-orders.csv', orders.map((order) => ({ customer: order.customer.name, total: order.totalPrice, status: order.status, createdAt: order.createdAt })))} className="inline-flex items-center justify-between rounded-full border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm font-semibold dark:bg-white/6">
                  Orders <Download className="h-4 w-4" />
                </button>
                <button onClick={() => downloadCsv('luxe-customers.csv', customers.map((customer) => ({ name: customer.name, email: customer.email, city: customer.city, orders: customer.orders, spent: customer.spent, favoriteProduct: customer.favoriteProduct })))} className="inline-flex items-center justify-between rounded-full border border-theme-line/60 bg-theme-ivory/70 px-4 py-3 text-sm font-semibold dark:bg-white/6">
                  Customers <Download className="h-4 w-4" />
                </button>
              </div>
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

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionShell eyebrow="Analytics Graph" title="Revenue Pulse" action={<div className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/66 dark:bg-white/5 dark:text-theme-ivory/64"><BarChart3 className="h-3.5 w-3.5 text-theme-bronze" /> Last 6 Months</div>}>
          <div className="flex h-[300px] items-end gap-4 rounded-[1.6rem] border border-theme-line/50 bg-white/70 p-5 dark:bg-white/4">
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
        </SectionShell>

        <SectionShell eyebrow="Operations Feed" title="Recent Activity" action={<Link href="/admin/orders" className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64">Open Orders <ArrowRight className="h-3.5 w-3.5" /></Link>}>
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
        <div id="customers">
        <SectionShell eyebrow="Behavior & Preferences" title="Customer Intelligence">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/4"><p className="text-xs uppercase tracking-[0.24em] text-theme-bronze">High Value</p><p className="mt-3 font-display text-3xl text-theme-ink dark:text-theme-ivory">{customers.filter((customer) => customer.spent >= 50000).length}</p></div>
            <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/4"><p className="text-xs uppercase tracking-[0.24em] text-theme-bronze">Repeat Buyers</p><p className="mt-3 font-display text-3xl text-theme-ink dark:text-theme-ivory">{customers.filter((customer) => customer.orders > 1).length}</p></div>
            <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/4"><p className="text-xs uppercase tracking-[0.24em] text-theme-bronze">Top City</p><p className="mt-3 font-display text-3xl text-theme-ink dark:text-theme-ivory">{customers[0]?.city || 'N/A'}</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {customers.slice(0, 6).map((customer) => (
              <div key={customer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-theme-line/50 bg-theme-ivory/62 px-4 py-4 dark:bg-white/5">
                <div><p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">{customer.name}</p><p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/56">{customer.email} · {customer.city}</p></div>
                <div className="grid min-w-[260px] gap-2 sm:grid-cols-3">
                  <div><p className="text-[0.65rem] uppercase tracking-[0.22em] text-theme-bronze">Orders</p><p className="mt-1 text-sm font-semibold">{customer.orders}</p></div>
                  <div><p className="text-[0.65rem] uppercase tracking-[0.22em] text-theme-bronze">Spent</p><p className="mt-1 text-sm font-semibold">{formatCurrency(customer.spent)}</p></div>
                  <div><p className="text-[0.65rem] uppercase tracking-[0.22em] text-theme-bronze">Preference</p><p className="mt-1 text-sm font-semibold">{customer.favoriteProduct}</p></div>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
        </div>

        <SectionShell eyebrow="Store Controls" title="Maintenance & Settings" action={<button onClick={handleSaveSettings} disabled={savingSettings} className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)]">Save Controls</button>}>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.6rem] border border-theme-line/50 bg-white/70 p-5 dark:bg-white/4">
              <div className="flex items-start justify-between gap-4">
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, orderAlerts: !current.notifications.orderAlerts } }))} className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-semibold transition ${settings.notifications.orderAlerts ? 'border-theme-bronze bg-theme-bronze/10 text-theme-bronze' : 'border-theme-line/60 bg-white/70 text-theme-walnut/70 dark:bg-white/6 dark:text-theme-ivory/64'}`}>Order alerts</button>
                  <button type="button" onClick={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, lowStockAlerts: !current.notifications.lowStockAlerts } }))} className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-semibold transition ${settings.notifications.lowStockAlerts ? 'border-theme-bronze bg-theme-bronze/10 text-theme-bronze' : 'border-theme-line/60 bg-white/70 text-theme-walnut/70 dark:bg-white/6 dark:text-theme-ivory/64'}`}>Low stock alerts</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[{ label: 'Role Based Access', value: 'Admin', icon: ShieldCheck }, { label: 'Security Model', value: 'JWT Session', icon: Settings2 }, { label: 'Experience Mode', value: 'Luxury UI', icon: Sparkles }].map((item) => {
              const Icon = item.icon;
              return <div key={item.label} className="rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/62 p-4 dark:bg-white/5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-theme-ink p-2 text-white dark:bg-white dark:text-[var(--theme-contrast-ink)]"><Icon className="h-4 w-4" /></div><div><p className="text-[0.66rem] uppercase tracking-[0.24em] text-theme-bronze">{item.label}</p><p className="mt-1 text-sm font-semibold text-theme-ink dark:text-theme-ivory">{item.value}</p></div></div></div>;
            })}
          </div>
        </SectionShell>
      </div>

      <CatalogCollectionsStudio catalogOptions={catalogOptions} onRefresh={refreshDashboard} />

      <div id="products">
        <ProductStudio
          products={products}
          catalogOptions={catalogOptions}
          onRefresh={refreshDashboard}
        />
      </div>

      <SectionShell eyebrow="Store Operations" title="Order Management" action={<Link href="/admin/orders" className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-bronze dark:bg-white dark:text-[var(--theme-contrast-ink)]">Open Full Orders <ArrowRight className="h-3.5 w-3.5" /></Link>}>
        <div className="grid gap-4 lg:grid-cols-3">
          {orders.slice(0, 3).map((order) => (
            <div key={order._id} className="rounded-[1.6rem] border border-theme-line/50 bg-white/72 p-5 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">{order.status}</p><p className="mt-2 text-base font-semibold text-theme-ink dark:text-theme-ivory">{order.customer.name}</p></div><Wallet className="h-5 w-5 text-theme-bronze" /></div>
              <p className="mt-4 text-2xl font-display text-theme-ink dark:text-theme-ivory">{formatCurrency(order.totalPrice)}</p>
              <p className="mt-2 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">{order.totalItems} items · {order.customer.city}</p>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
