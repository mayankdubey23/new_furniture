import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeGoogleAuthorizationCode, resolveAppUrl } from '@/lib/googleAuth';
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

async function clearGoogleOAuthCookies() {
  const cookieStore = await cookies();

  for (const cookieName of [
    GOOGLE_OAUTH_STATE_COOKIE,
    GOOGLE_OAUTH_RETURN_TO_COOKIE,
    GOOGLE_OAUTH_TAB_COOKIE,
  ]) {
    cookieStore.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }
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
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value || '';
  const returnTo = normalizeInternalPath(
    cookieStore.get(GOOGLE_OAUTH_RETURN_TO_COOKIE)?.value || '/'
  );
  const intent = normalizeIntent(cookieStore.get(GOOGLE_OAUTH_TAB_COOKIE)?.value || 'login');

  await clearGoogleOAuthCookies();

  if (request.nextUrl.searchParams.get('error')) {
    return buildLoginRedirect(request, 'google_cancelled', intent);
  }

  const state = request.nextUrl.searchParams.get('state');
  if (!expectedState || !state || state !== expectedState) {
    return buildLoginRedirect(request, 'google_state_invalid', intent);
  }

  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return buildLoginRedirect(request, 'google_missing_code', intent);
  }

  try {
    const googleProfile = await exchangeGoogleAuthorizationCode(request, code);
    await signInWithGoogleProfile(googleProfile);

    return NextResponse.redirect(new URL(returnTo, resolveAppUrl(request)));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'GOOGLE_ACCOUNT_LINK_REQUIRED') {
        return buildLoginRedirect(request, 'google_link_existing_account', intent);
      }

      if (err.message === 'GOOGLE_AUTH_NOT_CONFIGURED') {
        return buildLoginRedirect(request, 'google_not_configured', intent);
      }

      if (
        err.message === 'GOOGLE_EMAIL_NOT_VERIFIED' ||
        err.message === 'INVALID_GOOGLE_TOKEN' ||
        err.message === 'INVALID_GOOGLE_CODE'
      ) {
        return buildLoginRedirect(request, 'google_verification_failed', intent);
      }
    }

    console.error('Google OAuth callback error:', err);
    return buildLoginRedirect(request, 'google_failed', intent);
  }
}
