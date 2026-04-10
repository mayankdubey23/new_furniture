import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order, { type OrderStatus } from '@/models/Order';
import { adminMiddleware } from '@/lib/auth';
import { getUserFromCookie } from '@/lib/userAuth';
import {
  applyStatusTransition,
  createOrderStatusNotification,
  normalizeTrackingReference,
  sanitizeOrderForClient,
  sendShipmentEmail,
  type MutableOrderRecord,
} from '@/lib/server/orderLifecycle';

const VALID_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await getUserFromCookie();
    const emailFromQuery = request.nextUrl.searchParams.get('email') || '';
    const viewerEmail = (user?.email || emailFromQuery).trim().toLowerCase();

    if (!viewerEmail) {
      return NextResponse.json(
        { error: 'Please provide the order email to view tracking details.' },
        { status: 401 }
      );
    }

    const order = await Order.findOne({
      _id: id,
      'customer.email': viewerEmail,
    }).lean();

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(sanitizeOrderForClient(order as Record<string, unknown>));
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const { id } = await params;
    const data = (await request.json()) as {
      status?: OrderStatus;
      trackingNumber?: string;
      estimatedDelivery?: string | null;
      notes?: string;
    };
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (typeof data.notes === 'string') {
      order.notes = data.notes.trim();
    }

    if (typeof data.trackingNumber === 'string') {
      const normalizedTrackingNumber = normalizeTrackingReference(data.trackingNumber);
      order.trackingNumber = normalizedTrackingNumber || undefined;
    }

    if (data.estimatedDelivery === null || data.estimatedDelivery === '') {
      order.estimatedDelivery = undefined;
    } else if (typeof data.estimatedDelivery === 'string') {
      const parsedDate = new Date(data.estimatedDelivery);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid estimated delivery date' }, { status: 400 });
      }
      order.estimatedDelivery = parsedDate;
    }

    let statusChanged = false;
    if (typeof data.status === 'string') {
      if (!VALID_STATUSES.includes(data.status)) {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
      }
      statusChanged = applyStatusTransition(
        order as unknown as MutableOrderRecord,
        data.status
      );
    }

    await order.save();

    let shipmentEmailSent = false;
    if (statusChanged && typeof data.status === 'string') {
      await createOrderStatusNotification(order as unknown as MutableOrderRecord, data.status);
      const emailResult = await sendShipmentEmail(
        order as unknown as MutableOrderRecord,
        data.status
      );
      shipmentEmailSent = emailResult.sent;
    }

    return NextResponse.json({
      ...sanitizeOrderForClient(order.toObject() as Record<string, unknown>),
      shipmentEmailSent,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
