import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { adminMiddleware } from '@/lib/auth';
import { createRazorpayOrder, getRazorpayPublicConfig, isRazorpayConfigured } from '@/lib/server/razorpay';
import {
  appendStatusTimelineEntry,
  ensureTrackingMetadata,
  type MutableOrderRecord,
} from '@/lib/server/orderLifecycle';
import {
  DEFAULT_COUNTRY_CODE,
  buildCustomerAddress,
  getCountryOption,
  getIndianCityDirectory,
} from '@/lib/addressDirectory';

interface IncomingOrderItem {
  productId?: string;
  name?: string;
  price?: number;
  image?: string;
  quantity?: number;
}

interface IncomingCustomer {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

const PINCODE_PATTERN = /^\d{6}$/;

function normalizeItems(items: IncomingOrderItem[] = []) {
  return items
    .map((item) => ({
      productId: String(item.productId || '').trim(),
      name: String(item.name || '').trim(),
      price: Number(item.price || 0),
      image: String(item.image || '').trim(),
      quantity: Number(item.quantity || 0),
    }))
    .filter((item) => item.productId && item.name && item.price > 0 && item.quantity > 0);
}

function normalizeCustomer(customer: IncomingCustomer = {}) {
  const addressLine1 = String(customer.addressLine1 || customer.address || '').trim();
  const addressLine2 = String(customer.addressLine2 || '').trim();

  return {
    name: String(customer.name || '').trim(),
    email: String(customer.email || '').trim().toLowerCase(),
    phone: String(customer.phone || '').trim(),
    country: String(customer.country || DEFAULT_COUNTRY_CODE).trim().toUpperCase(),
    state: String(customer.state || '').trim(),
    addressLine1,
    addressLine2,
    address: buildCustomerAddress(addressLine1, addressLine2),
    city: String(customer.city || '').trim(),
    pincode: String(customer.pincode || '')
      .replace(/\D/g, '')
      .slice(0, 6),
  };
}


export async function GET(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = (await request.json()) as {
      items?: IncomingOrderItem[];
      customer?: IncomingCustomer;
      notes?: string;
      paymentMethod?: 'cod' | 'razorpay';
    };

    const items = normalizeItems(data.items);
    const customer = normalizeCustomer(data.customer);
    const paymentMethod = data.paymentMethod === 'razorpay' ? 'razorpay' : 'cod';
    const notes = String(data.notes || '').trim();

    if (!items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (
      !customer.name ||
      !customer.email ||
      !customer.phone ||
      !customer.country ||
      !customer.state ||
      !customer.addressLine1 ||
      !customer.address ||
      !customer.city ||
      !customer.pincode
    ) {
      return NextResponse.json(
        {
          error:
            'All delivery fields (name, email, phone, country, state, address, city, pincode) are required',
        },
        { status: 400 }
      );
    }

    if (!getCountryOption(customer.country) || customer.country !== DEFAULT_COUNTRY_CODE) {
      return NextResponse.json(
        { error: 'Structured checkout currently supports India addresses only.' },
        { status: 400 }
      );
    }

    if (!PINCODE_PATTERN.test(customer.pincode)) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit pincode' }, { status: 400 });
    }

    const cityDirectory = getIndianCityDirectory(customer.state, customer.city);

    if (!cityDirectory) {
      return NextResponse.json(
        { error: 'Please choose a valid city for the selected state.' },
        { status: 400 }
      );
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = Number(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );

    if (paymentMethod === 'razorpay') {
      if (!isRazorpayConfigured()) {
        return NextResponse.json(
          { error: 'Online payment is not configured yet. Please choose Cash on Delivery for now.' },
          { status: 503 }
        );
      }

      const order = new Order({
        items,
        totalItems,
        totalPrice,
        customer,
        notes,
        status: 'pending',
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        paymentProvider: 'razorpay',
      });
      ensureTrackingMetadata(order as unknown as MutableOrderRecord);
      appendStatusTimelineEntry(order as unknown as MutableOrderRecord, 'pending');

      const gatewayOrder = await createRazorpayOrder({
        amount: totalPrice,
        receipt: `luxe_${String(order._id).slice(-14)}`,
        notes: {
          localOrderId: String(order._id),
          customerName: customer.name,
          customerPhone: customer.phone,
        },
      });

      order.gatewayOrderId = gatewayOrder.id;
      await order.save();

      const gatewayConfig = getRazorpayPublicConfig();

      return NextResponse.json(
        {
          success: true,
          orderId: String(order._id),
          trackingNumber: order.trackingNumber,
          totalPrice,
          paymentMethod: 'razorpay',
          paymentStatus: order.paymentStatus,
          requiresPayment: true,
          gateway: {
            provider: 'razorpay',
            keyId: gatewayConfig.keyId,
            orderId: gatewayOrder.id,
            amount: gatewayOrder.amount,
            currency: gatewayOrder.currency,
            name: 'LUXE',
            description: `Order #${String(order._id).slice(-8).toUpperCase()}`,
            prefill: {
              name: customer.name,
              email: customer.email,
              contact: customer.phone,
            },
          },
        },
        { status: 201 }
      );
    }

    const order = new Order({
      items,
      totalItems,
      totalPrice,
      customer,
      notes,
      status: 'pending',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
    });
    ensureTrackingMetadata(order as unknown as MutableOrderRecord);
    appendStatusTimelineEntry(order as unknown as MutableOrderRecord, 'pending');
    await order.save();

    return NextResponse.json(
      {
        success: true,
        orderId: String(order._id),
        trackingNumber: order.trackingNumber,
        totalPrice,
        paymentMethod: 'cod',
        paymentStatus: order.paymentStatus,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
