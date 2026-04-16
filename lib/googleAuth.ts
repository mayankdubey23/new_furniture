import { randomBytes } from 'crypto';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';

const googleIdTokenClient = new OAuth2Client();

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  isAuthoritativeEmail: boolean;
  picture?: string | null;
}

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
}

export function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || null;
}

export function isGoogleAuthConfigured() {
  return Boolean(getGoogleClientId());
}

export function isGoogleOAuthConfigured() {
  return Boolean(getGoogleClientId() && getGoogleClientSecret());
}

function resolveConfiguredSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  return siteUrl?.trim().replace(/\/$/, '') || null;
}

export function resolveAppUrl(request?: Request) {
  const configuredSiteUrl = resolveConfiguredSiteUrl();
  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  if (!request) {
    return 'http://localhost:3000';
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }

  return new URL(request.url).origin.replace(/\/$/, '');
}

export function getGoogleOAuthRedirectUri(request: Request) {
  return `${resolveAppUrl(request)}/api/auth/user/google/callback`;
}

export function createGoogleOAuthState() {
  return randomBytes(24).toString('hex');
}

function createGoogleOAuthClient(request: Request) {
  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_AUTH_NOT_CONFIGURED');
  }

  return new OAuth2Client(clientId, clientSecret, getGoogleOAuthRedirectUri(request));
}

function normalizeGoogleProfile(payload: TokenPayload): GoogleUserProfile {
  if (!payload.sub || !payload.email) {
    throw new Error('INVALID_GOOGLE_TOKEN');
  }

  if (!payload.email_verified) {
    throw new Error('GOOGLE_EMAIL_NOT_VERIFIED');
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedName = String(payload.name || normalizedEmail.split('@')[0]).trim();
  const isAuthoritativeEmail =
    normalizedEmail.endsWith('@gmail.com') || Boolean(payload.hd);

  return {
    googleId: payload.sub,
    email: normalizedEmail,
    name: normalizedName,
    isAuthoritativeEmail,
    picture: payload.picture || null,
  };
}

export function createGoogleAuthorizationUrl(request: Request, state: string) {
  const oauthClient = createGoogleOAuthClient(request);

  return oauthClient.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
  });
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleUserProfile> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('GOOGLE_AUTH_NOT_CONFIGURED');
  }

  let ticket;
  try {
    ticket = await googleIdTokenClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
  } catch {
    throw new Error('INVALID_GOOGLE_TOKEN');
  }

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('INVALID_GOOGLE_TOKEN');
  }

  return normalizeGoogleProfile(payload);
}

export async function exchangeGoogleAuthorizationCode(
  request: Request,
  code: string
): Promise<GoogleUserProfile> {
  const oauthClient = createGoogleOAuthClient(request);

  try {
    const { tokens } = await oauthClient.getToken(code);
    if (!tokens.id_token) {
      throw new Error('INVALID_GOOGLE_CODE');
    }

    return await verifyGoogleCredential(tokens.id_token);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'INVALID_GOOGLE_TOKEN' || error.message === 'GOOGLE_EMAIL_NOT_VERIFIED')
    ) {
      throw error;
    }

    throw new Error('INVALID_GOOGLE_CODE');
  }
}
