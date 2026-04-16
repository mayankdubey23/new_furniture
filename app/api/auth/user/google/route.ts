import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createGoogleAuthorizationUrl,
  createGoogleOAuthState,
  getGoogleClientId,
  isGoogleOAuthConfigured,
  resolveAppUrl,
  verifyGoogleCredential,
} from '@/lib/googleAuth';
import { signInWithGoogleProfile } from '@/lib/server/googleUserAuth';

const GOOGLE_OAUTH_STATE_COOKIE = 'google-oauth-state';
const GOOGLE_OAUTH_RETURN_TO_COOKIE = 'google-oauth-return-to';
const GOOGLE_OAUTH_TAB_COOKIE = 'google-oauth-tab';

function normalizeInternalPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}

function normalizeIntent(value: string | null) {
  return value === 'signup' ? 'signup' : 'login';
}

function buildLoginRedirect(request: NextRequest, errorCode: string, intent: string) {
  const loginUrl = new URL('/login', resolveAppUrl(request));
  loginUrl.searchParams.set('authError', errorCode);

  if (intent === 'signup') {
    loginUrl.searchParams.set('tab', 'signup');
  }

  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const intent = normalizeIntent(request.nextUrl.searchParams.get('intent'));

  if (!isGoogleOAuthConfigured()) {
    return buildLoginRedirect(request, 'google_not_configured', intent);
  }

  const state = createGoogleOAuthState();
  const returnTo = normalizeInternalPath(
    request.nextUrl.searchParams.get('returnTo') || request.nextUrl.searchParams.get('next')
  );

  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });
  cookieStore.set(GOOGLE_OAUTH_RETURN_TO_COOKIE, returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });
  cookieStore.set(GOOGLE_OAUTH_TAB_COOKIE, intent, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  return NextResponse.redirect(createGoogleAuthorizationUrl(request, state));
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getGoogleClientId();
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google sign-in is not configured yet.' },
        { status: 503 }
      );
    }

    const { credential } = await request.json();
    if (!credential || typeof credential !== 'string') {
      return NextResponse.json(
        { error: 'Google credential is required.' },
        { status: 400 }
      );
    }

    const googleProfile = await verifyGoogleCredential(credential);
    const sessionUser = await signInWithGoogleProfile(googleProfile);

    return NextResponse.json({ success: true, ...sessionUser });
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

      if (err.message === 'GOOGLE_ACCOUNT_LINK_REQUIRED') {
        return NextResponse.json(
          {
            error:
              'This email already has an account. Please sign in with your password first before using Google.',
          },
          { status: 409 }
        );
      }
    }

    console.error('Google auth error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
