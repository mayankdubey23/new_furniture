import { NextResponse } from 'next/server';
import { getRazorpayPublicConfig } from '@/lib/server/razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getRazorpayPublicConfig());
}
