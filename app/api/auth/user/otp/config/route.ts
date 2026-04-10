import { NextResponse } from 'next/server';
import { isPhoneOtpConfigured } from '@/lib/phoneOtp';

export async function GET() {
  return NextResponse.json({ enabled: isPhoneOtpConfigured() });
}
