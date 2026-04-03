export interface AdminColorEntry {
  name: string;
  image: string;
}

export interface AdminProduct {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  category: string;
  description: string;
  imageUrl: string;
  eyebrow: string;
  modelPath?: string | null;
  images: string[];
  colors: AdminColorEntry[];
  specs: {
    material: string;
    foam?: string;
    dimensions: string;
    weight: string;
    warranty: string;
  };
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface AdminOrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface AdminOrder {
  _id: string;
  totalPrice: number;
  totalItems: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
  items: AdminOrderItem[];
  customer: AdminOrderCustomer;
  notes?: string;
}

export interface AdminSettingsState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  notifications: {
    orderAlerts: boolean;
    lowStockAlerts: boolean;
  };
  adminProfile: {
    displayName: string;
    email: string;
  };
}

export interface DerivedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  spent: number;
  lastOrder: string;
  favoriteProduct: string;
}

export function deriveCustomers(orders: AdminOrder[]): DerivedCustomer[] {
  const map = new Map<string, DerivedCustomer & { favorites: Record<string, number> }>();

  orders.forEach((order) => {
    const key = order.customer.email.toLowerCase();
    const current = map.get(key) ?? {
      id: key,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      city: order.customer.city,
      orders: 0,
      spent: 0,
      lastOrder: order.createdAt,
      favoriteProduct: 'N/A',
      favorites: {},
    };

    current.orders += 1;
    current.spent += order.totalPrice;

    if (new Date(order.createdAt) > new Date(current.lastOrder)) {
      current.lastOrder = order.createdAt;
      current.name = order.customer.name;
      current.phone = order.customer.phone;
      current.city = order.customer.city;
    }

    order.items.forEach((item) => {
      current.favorites[item.name] = (current.favorites[item.name] || 0) + item.quantity;
    });

    const favoriteEntry = Object.entries(current.favorites).sort((a, b) => b[1] - a[1])[0];
    current.favoriteProduct = favoriteEntry?.[0] || 'N/A';

    map.set(key, current);
  });

  return Array.from(map.values())
    .map((entry) => {
      const { favorites: ignoredFavorites, ...customer } = entry;
      void ignoredFavorites;
      return customer;
    })
    .sort((a, b) => b.spent - a.spent);
}

export function deriveTopProducts(orders: AdminOrder[]) {
  const map = new Map<string, { name: string; units: number; revenue: number }>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const current = map.get(item.name) ?? { name: item.name, units: 0, revenue: 0 };
      current.units += item.quantity;
      current.revenue += item.quantity * item.price;
      map.set(item.name, current);
    });
  });

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

export function deriveRevenueSeries(orders: AdminOrder[], months = 6) {
  const now = new Date();
  const series = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      revenue: 0,
      orders: 0,
    };
  });

  const seriesMap = new Map(series.map((entry) => [entry.key, entry]));

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const match = seriesMap.get(key);
    if (!match) return;
    match.revenue += order.totalPrice;
    match.orders += 1;
  });

  return series;
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length || typeof window === 'undefined') return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? '');
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
