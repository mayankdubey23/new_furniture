import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import {
  applyStatusTransition,
  createOrderStatusNotification,
  type MutableOrderRecord,
} from '@/lib/server/orderLifecycle';
import { verifyRazorpaySignature } from '@/lib/server/razorpay';

interface VerifyPaymentPayload {
  orderId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = (await request.json()) as VerifyPaymentPayload;
    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Incomplete payment verification payload' }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.gatewayOrderId !== razorpayOrderId) {
      order.paymentStatus = 'failed';
      await order.save();

      return NextResponse.json({ error: 'Payment order mismatch' }, { status: 400 });
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      order.paymentStatus = 'failed';
      await order.save();

      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    order.paymentStatus = 'paid';
    order.paymentMethod = 'razorpay';
    order.paymentProvider = 'razorpay';
    order.gatewayPaymentId = razorpayPaymentId;
    order.paidAt = new Date();
    const statusChanged = applyStatusTransition(
      order as unknown as MutableOrderRecord,
      'paid'
    );

    await order.save();
    if (statusChanged) {
      await createOrderStatusNotification(order as unknown as MutableOrderRecord, 'paid');
    }

    return NextResponse.json({
      success: true,
      orderId: String(order._id),
      paymentStatus: order.paymentStatus,
      status: order.status,
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
