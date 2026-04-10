import { OAuth2Client } from 'google-auth-library';

const googleAuthClient = new OAuth2Client();

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

export function isGoogleAuthConfigured() {
  return Boolean(getGoogleClientId());
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleUserProfile> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('GOOGLE_AUTH_NOT_CONFIGURED');
  }

  let ticket;
  try {
    ticket = await googleAuthClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
  } catch {
    throw new Error('INVALID_GOOGLE_TOKEN');
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
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
