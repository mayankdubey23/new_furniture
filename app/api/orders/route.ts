import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { adminMiddleware } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).populate('items.productId').lean();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const data = await request.json();
    const order = await Order.create(data);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

