import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { getUserFromCookie } from '@/lib/userAuth';
import { sanitizeOrderForClient } from '@/lib/server/orderLifecycle';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getUserFromCookie();

    if (!user?.email) {
      return NextResponse.json({ error: 'Please sign in to view your orders.' }, { status: 401 });
    }

    await dbConnect();

    const orders = await Order.find({
      'customer.email': user.email.trim().toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      orders: orders.map((order) => sanitizeOrderForClient(order as Record<string, unknown>)),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load your orders.' }, { status: 500 });
  }
}
