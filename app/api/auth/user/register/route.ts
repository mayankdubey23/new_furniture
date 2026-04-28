import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import { maybeProxyExternalApiRoute } from '@/lib/api/externalRouteProxy';
import User from '@/models/User';
import {
  isPhoneOtpConfigured,
  normalizePhoneNumber,
  verifyPhoneOtp,
} from '@/lib/phoneOtp';
import { createUserToken, setUserSession } from '@/lib/userAuth';

const ENGLISH_NAME_PATTERN = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEnglishName(value: unknown) {
  return cleanString(value)
    .replace(/[^A-Za-z\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 60);
}

function normalizeEmail(value: unknown) {
  return cleanString(value).replace(/\s+/g, '').toLowerCase().slice(0, 120);
}

export async function POST(request: NextRequest) {
  try {
    const externalResponse = await maybeProxyExternalApiRoute(request);
    if (externalResponse) {
      return externalResponse;
    }

    await dbConnect();
    const { name, email, password, phone, otpCode, userName, username } = await request.json();
    const phoneOtpEnabled = isPhoneOtpConfigured();
    const normalizedName = normalizeEnglishName(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = String(username || userName || '')
      .trim()
      .toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!ENGLISH_NAME_PATTERN.test(normalizedName)) {
      return NextResponse.json(
        { error: 'Name must contain English letters only.' },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
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

    const existing = await User.findOne({ email: normalizedEmail });
    const existingUserId = existing?._id ? String(existing._id) : null;

    if (existing?.password) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    if (existing?.googleId) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please continue with Google.' },
        { status: 409 }
      );
    }

    if (normalizedPhone) {
      const existingPhoneUser = await User.findOne({
        phone: normalizedPhone,
        ...(existingUserId ? { _id: { $ne: existingUserId } } : {}),
      });
      if (existingPhoneUser) {
        return NextResponse.json(
          { error: 'An account with this contact number already exists.' },
          { status: 409 }
        );
      }
    }

    if (normalizedUsername) {
      const existingUsernameUser = await User.findOne({
        username: normalizedUsername,
        ...(existingUserId ? { _id: { $ne: existingUserId } } : {}),
      });
      if (existingUsernameUser) {
        return NextResponse.json(
          { error: 'An account with this username already exists.' },
          { status: 409 }
        );
      }
    }

    if (phoneOtpEnabled && normalizedPhone) {
      await verifyPhoneOtp(normalizedPhone, normalizedOtpCode);
    }

    let user;

    if (existing) {
      const phoneChanged = normalizedPhone && existing.phone !== normalizedPhone;

      existing.name = normalizedName;
      existing.email = normalizedEmail;
      existing.username = normalizedUsername || existing.username || undefined;
      existing.password = password;
      existing.active = true;

      if (normalizedPhone) {
        existing.phone = normalizedPhone;
      }

      if (phoneOtpEnabled && normalizedPhone) {
        existing.phoneVerifiedAt = new Date();
      } else if (phoneChanged) {
        existing.phoneVerifiedAt = null;
      }

      user = await existing.save();
    } else {
      user = await User.create({
        name: normalizedName,
        username: normalizedUsername || undefined,
        email: normalizedEmail,
        phone: normalizedPhone || undefined,
        phoneVerifiedAt: phoneOtpEnabled && normalizedPhone ? new Date() : null,
        password,
      });
    }

    const token = createUserToken(user._id.toString(), user.name, user.email);

    const cookieStore = await cookies();
    setUserSession(cookieStore, token);

    return NextResponse.json(
      { success: true, name: user.name, email: user.email, completedAccount: Boolean(existing) },
      { status: existing ? 200 : 201 }
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
