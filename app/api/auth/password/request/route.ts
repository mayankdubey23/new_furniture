import { NextRequest, NextResponse } from 'next/server';
import { requestAdminPasswordCode } from '@/lib/auth';

type PasswordChannel = 'email' | 'phone';

export async function POST(request: NextRequest) {
  try {
    const { channel } = (await request.json()) as {
      channel?: PasswordChannel;
    };

    if (channel !== 'email' && channel !== 'phone') {
      return NextResponse.json({ error: 'Choose email or phone recovery.' }, { status: 400 });
    }

    const result = await requestAdminPasswordCode(channel);

    return NextResponse.json({
      success: true,
      channel: result.channel,
      destination: result.maskedDestination,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send a recovery code.';

    if (
      message === 'PHONE_RECOVERY_UNAVAILABLE' ||
      message === 'EMAIL_RECOVERY_UNAVAILABLE' ||
      message === 'PASSWORD_RECOVERY_UNAVAILABLE'
    ) {
      return NextResponse.json(
        { error: 'That recovery method is not configured yet.' },
        { status: 400 }
      );
    }

    if (message === 'PHONE_OTP_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Phone recovery is not configured yet.' },
        { status: 503 }
      );
    }

    if (message === 'EMAIL_RECOVERY_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Email recovery is not configured yet.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to send a recovery code right now.' },
      { status: 500 }
    );
  }
}
