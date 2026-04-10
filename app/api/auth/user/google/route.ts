import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { getGoogleClientId, verifyGoogleCredential } from '@/lib/googleAuth';
import { createUserToken } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  try {
    const clientId = getGoogleClientId();
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google sign-in is not configured yet.' },
        { status: 503 }
      );
    }

    await dbConnect();

    const { credential } = await request.json();
    if (!credential || typeof credential !== 'string') {
      return NextResponse.json(
        { error: 'Google credential is required.' },
        { status: 400 }
      );
    }

    const googleProfile = await verifyGoogleCredential(credential);

    let user = await User.findOne({ googleId: googleProfile.googleId });

    if (!user) {
      user = await User.findOne({ email: googleProfile.email });
    }

    if (!user) {
      user = await User.create({
        name: googleProfile.name,
        email: googleProfile.email,
        googleId: googleProfile.googleId,
      });
    } else {
      if (!user.googleId && !googleProfile.isAuthoritativeEmail) {
        return NextResponse.json(
          {
            error:
              'This email already has an account. Please sign in with your password first before using Google.',
          },
          { status: 409 }
        );
      }

      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = googleProfile.googleId;
        shouldSave = true;
      }

      if (!user.name?.trim() && googleProfile.name) {
        user.name = googleProfile.name;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    const token = createUserToken(user._id.toString(), user.name, user.email);

    const cookieStore = await cookies();
    cookieStore.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true, name: user.name, email: user.email });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'GOOGLE_AUTH_NOT_CONFIGURED') {
        return NextResponse.json(
          { error: 'Google sign-in is not configured yet.' },
          { status: 503 }
        );
      }

      if (
        err.message === 'INVALID_GOOGLE_TOKEN' ||
        err.message === 'GOOGLE_EMAIL_NOT_VERIFIED'
      ) {
        return NextResponse.json(
          { error: 'Google sign-in could not be verified.' },
          { status: 401 }
        );
      }
    }

    console.error('Google auth error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
