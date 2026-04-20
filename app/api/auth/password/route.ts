import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setAdminSession, updateAdminPassword } from '@/lib/auth';

type PasswordChannel = 'email' | 'phone';

export async function POST(request: NextRequest) {
  try {
    const { channel, code, password } = (await request.json()) as {
      channel?: PasswordChannel;
      code?: string;
      password?: string;
    };

    if (channel !== 'email' && channel !== 'phone') {
      return NextResponse.json({ error: 'Choose email or phone recovery.' }, { status: 400 });
    }

    const result = await updateAdminPassword(channel, String(code || ''), String(password || ''));
    const cookieStore = await cookies();
    setAdminSession(cookieStore, result.token);

    return NextResponse.json({
      success: true,
      email: result.admin.email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update password.';

    if (message === 'PHONE_OTP_INVALID' || message === 'PHONE_OTP_REQUEST_FAILED') {
      return NextResponse.json(
        { error: 'Invalid OTP. Please verify your contact number and try again.' },
        { status: 401 }
      );
    }

    if (message === 'PHONE_OTP_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Phone recovery is not configured yet.' },
        { status: 503 }
      );
    }

    if (message === 'PHONE_RECOVERY_UNAVAILABLE' || message === 'EMAIL_RECOVERY_UNAVAILABLE') {
      return NextResponse.json(
        { error: 'That recovery method is not configured yet.' },
        { status: 400 }
      );
    }

    if (message === 'INVALID_RECOVERY_CODE') {
      return NextResponse.json(
        { error: 'Invalid or expired verification code.' },
        { status: 401 }
      );
    }

    if (
      message.includes('Password') ||
      message.includes('verification code') ||
      message.includes('uppercase') ||
      message.includes('lowercase') ||
      message.includes('number') ||
      message.includes('characters')
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Unable to update password right now.' },
      { status: 500 }
    );
  }
}
