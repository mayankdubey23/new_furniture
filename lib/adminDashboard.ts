import type { CatalogEntityRecord } from '@/lib/catalogEntities';
import type { ProductMedia, ProductSpecs } from '@/lib/productCatalog';

export interface AdminColorEntry {
  name: string;
  image: string;
}

export interface AdminProduct {
  _id: string;
  id: string;
  name: string;
  price: number;
  stock?: number;
  category: string;
  description: string;
  imageUrl: string;
  eyebrow: string;
  modelPath?: string | null;
  images: string[];
  media: ProductMedia;
  colors: AdminColorEntry[];
  specs: ProductSpecs;
  mainCategoryId?: string | null;
  subCategoryId?: string | null;
  brandId?: string | null;
  mainCategory?: CatalogEntityRecord | null;
  subCategory?: CatalogEntityRecord | null;
  brand?: CatalogEntityRecord | null;
  mainCategoryName?: string;
  subCategoryName?: string;
  brandName?: string;
  basePrice?: number;
  discount?: number;
  finalPrice?: number;
  inStock?: boolean;
  stockQuantity?: number;
  size?: string[];
  pic?: string[];
  color?: string[];
  active?: boolean;
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
  country?: string;
  state?: string;
  addressLine1?: string;
  addressLine2?: string;
  address: string;
  city: string;
  pincode: string;
}

export interface AdminOrder {
  _id: string;
  totalPrice: number;
  totalItems: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  paymentMethod?: 'cod' | 'razorpay';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentProvider?: 'razorpay';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paidAt?: string;
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
    phone: string;
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

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdfDocument(linesByPage: string[][]) {
  const encoder = new TextEncoder();
  const objects: string[] = [];
  const pageIds: number[] = [];
  const contentIds: number[] = [];

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  linesByPage.forEach((lines, pageIndex) => {
    const pageId = 4 + pageIndex * 2;
    const contentId = pageId + 1;
    const stream = [
      'BT',
      '/F1 10 Tf',
      '14 TL',
      '50 780 Td',
      ...lines.map((line) => `(${escapePdfText(line)}) Tj T*`),
      'ET',
    ].join('\n');
    const streamLength = encoder.encode(stream).length;

    pageIds.push(pageId);
    contentIds.push(contentId);
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let index = 1; index < objects.length; index += 1) {
    const objectBody = objects[index];
    if (!objectBody) {
      continue;
    }

    offsets[index] = encoder.encode(pdf).length;
    pdf += `${index} 0 obj\n${objectBody}\nendobj\n`;
  }

  const xrefOffset = encoder.encode(pdf).length;
  const xrefSize = objects.length;

  pdf += `xref\n0 ${xrefSize}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < xrefSize; index += 1) {
    const offset = offsets[index] || 0;
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${xrefSize} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
}

export function downloadPdf(
  filename: string,
  title: string,
  rows: Array<Record<string, string | number>>
) {
  if (!rows.length || typeof window === 'undefined') return;

  const headers = Object.keys(rows[0]);
  const generatedAt = new Date().toLocaleString('en-IN');
  const lines = [
    title,
    `Generated: ${generatedAt}`,
    '',
    ...rows.flatMap((row, index) => [
      `${index + 1}.`,
      ...headers.map((header) => `${header}: ${String(row[header] ?? '')}`),
      '',
    ]),
  ];
  const linesPerPage = 45;
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  const blob = buildPdfDocument(pages.length ? pages : [['No records found.']]);
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
