import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { getUserFromCookie } from '@/lib/userAuth';
import {
  normalizeTrackingReference,
  sanitizeOrderForClient,
} from '@/lib/server/orderLifecycle';

interface TrackOrderPayload {
  reference?: string;
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = (await request.json()) as TrackOrderPayload;
    const user = await getUserFromCookie();
    const reference = String(body.reference || '').trim();
    const viewerEmail = String(user?.email || body.email || '')
      .trim()
      .toLowerCase();

    if (!reference) {
      return NextResponse.json({ error: 'Order ID or tracking number is required.' }, { status: 400 });
    }

    if (!viewerEmail) {
      return NextResponse.json({ error: 'Order email is required.' }, { status: 400 });
    }

    const normalizedReference = normalizeTrackingReference(reference);
    const filters: Array<Record<string, unknown>> = [
      {
        trackingNumber: normalizedReference,
        'customer.email': viewerEmail,
      },
    ];

    if (Types.ObjectId.isValid(reference)) {
      filters.unshift({
        _id: reference,
        'customer.email': viewerEmail,
      });
    }

    const order = await Order.findOne({ $or: filters }).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'No order was found for that reference and email.' },
        { status: 404 }
      );
    }

    return NextResponse.json(sanitizeOrderForClient(order as Record<string, unknown>));
  } catch {
    return NextResponse.json({ error: 'Failed to track order.' }, { status: 500 });
  }
}
