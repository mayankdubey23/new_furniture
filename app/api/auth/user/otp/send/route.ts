import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import {
  isPhoneOtpConfigured,
  normalizePhoneNumber,
  sendPhoneOtp,
} from '@/lib/phoneOtp';

type OtpPurpose = 'signup' | 'login';

export async function POST(request: NextRequest) {
  try {
    if (!isPhoneOtpConfigured()) {
      return NextResponse.json(
        { error: 'Phone OTP is not configured yet.' },
        { status: 503 }
      );
    }

    const { phone, purpose } = (await request.json()) as {
      phone?: string;
      purpose?: OtpPurpose;
    };

    const normalizedPhone = normalizePhoneNumber(String(phone || ''));
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid contact number.' },
        { status: 400 }
      );
    }

    if (purpose !== 'signup' && purpose !== 'login') {
      return NextResponse.json({ error: 'Invalid OTP request.' }, { status: 400 });
    }

    await dbConnect();

    if (purpose === 'signup') {
      const existingUser = await User.findOne({ phone: normalizedPhone }).select('_id');
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this contact number already exists.' },
          { status: 409 }
        );
      }
    }

    if (purpose === 'login') {
      const existingUser = await User.findOne({
        phone: normalizedPhone,
        phoneVerifiedAt: { $ne: null },
      }).select('_id');

      if (!existingUser) {
        return NextResponse.json(
          { error: 'No verified account was found for this contact number.' },
          { status: 404 }
        );
      }
    }

    await sendPhoneOtp(normalizedPhone);

    return NextResponse.json({
      success: true,
      phone: normalizedPhone,
      message: 'OTP sent successfully.',
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'PHONE_OTP_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Phone OTP is not configured yet.' },
        { status: 503 }
      );
    }

    console.error('Send OTP error:', err);
    return NextResponse.json(
      { error: 'Unable to send OTP right now. Please try again.' },
      { status: 500 }
    );
  }
}
