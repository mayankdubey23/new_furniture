import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import {
  isPhoneOtpConfigured,
  normalizePhoneNumber,
  verifyPhoneOtp,
} from '@/lib/phoneOtp';
import { createUserToken } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, phone, otpCode } = await request.json();
    const phoneOtpEnabled = isPhoneOtpConfigured();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    let normalizedPhone: string | null = null;
    let normalizedOtpCode = '';

    if (phoneOtpEnabled) {
      if (!phone || !otpCode) {
        return NextResponse.json(
          { error: 'Contact number and OTP are required.' },
          { status: 400 }
        );
      }

      normalizedPhone = normalizePhoneNumber(String(phone || ''));
      if (!normalizedPhone) {
        return NextResponse.json(
          { error: 'Please enter a valid contact number.' },
          { status: 400 }
        );
      }

      normalizedOtpCode = String(otpCode || '').replace(/\D/g, '').slice(0, 6);
      if (normalizedOtpCode.length !== 6) {
        return NextResponse.json(
          { error: 'Please enter the 6-digit OTP.' },
          { status: 400 }
        );
      }
    } else if (phone?.trim()) {
      normalizedPhone = normalizePhoneNumber(String(phone || ''));
      if (!normalizedPhone) {
        return NextResponse.json(
          { error: 'Please enter a valid contact number.' },
          { status: 400 }
        );
      }
    }

    if (phoneOtpEnabled && !normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid contact number.' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        {
          error: existing.googleId
            ? 'An account with this email already exists. Please continue with Google.'
            : 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    if (normalizedPhone) {
      const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
      if (existingPhoneUser) {
        return NextResponse.json(
          { error: 'An account with this contact number already exists.' },
          { status: 409 }
        );
      }
    }

    if (phoneOtpEnabled && normalizedPhone) {
      await verifyPhoneOtp(normalizedPhone, normalizedOtpCode);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone || undefined,
      phoneVerifiedAt: phoneOtpEnabled && normalizedPhone ? new Date() : null,
      password,
    });

    const token = createUserToken(user._id.toString(), user.name, user.email);

    const cookieStore = await cookies();
    cookieStore.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json(
      { success: true, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message === 'PHONE_OTP_INVALID' || err.message === 'PHONE_OTP_REQUEST_FAILED')
    ) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please verify your contact number and try again.' },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === 'PHONE_OTP_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Phone OTP is not configured yet.' },
        { status: 503 }
      );
    }

    console.error('Register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
