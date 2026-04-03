import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { adminMiddleware } from '@/lib/auth';

// Public: get a single order (for confirmation / tracking)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin only: update order status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const { id } = await params;
    const data = await request.json();
    const order = await Order.findByIdAndUpdate(id, data, { new: true });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
