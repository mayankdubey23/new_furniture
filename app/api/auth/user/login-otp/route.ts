import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { normalizePhoneNumber, verifyPhoneOtp } from '@/lib/phoneOtp';
import { createUserToken } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { phone, otpCode } = (await request.json()) as {
      phone?: string;
      otpCode?: string;
    };

    const normalizedPhone = normalizePhoneNumber(String(phone || ''));
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid contact number.' },
        { status: 400 }
      );
    }

    const normalizedOtpCode = String(otpCode || '').replace(/\D/g, '').slice(0, 6);
    if (normalizedOtpCode.length !== 6) {
      return NextResponse.json(
        { error: 'Please enter the 6-digit OTP.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      phone: normalizedPhone,
      phoneVerifiedAt: { $ne: null },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No verified account was found for this contact number.' },
        { status: 404 }
      );
    }

    await verifyPhoneOtp(normalizedPhone, normalizedOtpCode);

    const token = createUserToken(user._id.toString(), user.name, user.email);

    const cookieStore = await cookies();
    cookieStore.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message === 'PHONE_OTP_INVALID' || err.message === 'PHONE_OTP_REQUEST_FAILED')
    ) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check the code and try again.' },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === 'PHONE_OTP_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Phone OTP is not configured yet.' },
        { status: 503 }
      );
    }

    console.error('Login OTP error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
