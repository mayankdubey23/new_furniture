import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { adminMiddleware } from '@/lib/auth';

// Admin only: list all orders
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

// Public: place an order (customer checkout)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const { items, customer } = data;

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (
      !customer?.name ||
      !customer?.email ||
      !customer?.phone ||
      !customer?.address ||
      !customer?.city ||
      !customer?.pincode
    ) {
      return NextResponse.json(
        { error: 'All delivery fields (name, email, phone, address, city, pincode) are required' },
        { status: 400 }
      );
    }

    const totalItems = items.reduce(
      (sum: number, i: { quantity: number }) => sum + i.quantity,
      0
    );
    const totalPrice = items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      items,
      totalItems,
      totalPrice,
      customer,
      notes: data.notes || '',
      status: 'pending',
    });

    return NextResponse.json({ success: true, orderId: order._id, totalPrice }, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
