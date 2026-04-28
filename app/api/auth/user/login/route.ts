import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { maybeProxyExternalApiRoute } from '@/lib/api/externalRouteProxy';
import { createUserToken, setUserSession } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  try {
    const externalResponse = await maybeProxyExternalApiRoute(request);
    if (externalResponse) {
      return externalResponse;
    }

    await dbConnect();
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.password) {
      if (!user.googleId && !user.phoneVerifiedAt) {
        return NextResponse.json(
          {
            code: 'PASSWORD_SETUP_REQUIRED',
            error:
              'This email was saved without a password. Continue with Create Account using the same email to set your password.',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          code: user.googleId && user.phoneVerifiedAt ? 'USE_GOOGLE_OR_OTP_LOGIN' : user.googleId ? 'USE_GOOGLE_LOGIN' : 'USE_OTP_LOGIN',
          error: user.googleId
            ? user.phoneVerifiedAt
              ? 'This account does not have a password. Please continue with Google or phone OTP.'
              : 'This account does not have a password. Please continue with Google sign-in.'
            : 'This account does not have a password. Please continue with phone OTP.',
        },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createUserToken(user._id.toString(), user.name, user.email);

    const cookieStore = await cookies();
    setUserSession(cookieStore, token);

    return NextResponse.json({ success: true, name: user.name, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
