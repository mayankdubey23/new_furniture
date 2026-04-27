import { createHash, randomInt } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import { SITE_NAME } from '@/lib/brand';
import { getAdminSettings } from '@/lib/services/adminSettings';
import {
  isPhoneOtpConfigured,
  normalizePhoneNumber,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '@/lib/phoneOtp';
import AdminAccount from '@/models/AdminAccount';
import AdminRecoveryCode from '@/models/AdminRecoveryCode';

const ADMIN_SESSION_COOKIE = 'admin-token';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;
const EMAIL_CODE_TTL_MINUTES = 10;
const PASSWORD_MIN_LENGTH = 10;

type AdminChannel = 'email' | 'phone';

type AdminJwtPayload = {
  adminId: string;
  email: string;
  scope: 'admin';
};

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export interface AdminSessionUser {
  adminId: string;
  email: string;
  phone?: string;
  username?: string;
}

export interface AdminRecoveryOption {
  available: boolean;
  maskedDestination: string;
  reason: string;
}

export interface AdminAuthStatus {
  hasPassword: boolean;
  passwordPolicy: string;
  guidance: string;
  recovery: {
    email: AdminRecoveryOption;
    phone: AdminRecoveryOption;
  };
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    Number((error as { code?: number }).code) === 11000
  );
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error('JWT_SECRET is missing. Add it to .env.local and restart the dev server.');
  }

  return secret;
}

function normalizeEmail(value: string | undefined | null) {
  const email = String(value || '').trim().toLowerCase();
  if (!email || !email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    return '';
  }

  return email;
}

function normalizeUsername(value: string | undefined | null) {
  const username = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '');

  return username || '';
}

function isUsableRecoveryEmail(email: string) {
  return Boolean(email) && !email.endsWith('.local');
}

function maskEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return '';

  const [localPart, domain] = normalized.split('@');
  const visibleLocal = localPart.slice(0, 2);
  const hiddenLocal = '*'.repeat(Math.max(localPart.length - visibleLocal.length, 1));
  return `${visibleLocal}${hiddenLocal}@${domain}`;
}

function maskPhone(phone: string) {
  const normalized = normalizePhoneNumber(phone) || '';
  if (!normalized) return '';

  const visibleTail = normalized.slice(-4);
  return `${'*'.repeat(Math.max(normalized.length - 4, 4))}${visibleTail}`;
}

function getRecoverySender() {
  return (
    process.env.ADMIN_SECURITY_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.ORDER_STATUS_FROM_EMAIL ||
    ''
  ).trim();
}

function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
    priority: 'high' as const,
  };
}

function buildPasswordPolicyMessage() {
  return 'Use at least 10 characters with uppercase, lowercase, and a number.';
}

function validateAdminPassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'Password must be at least 10 characters long.';
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return buildPasswordPolicyMessage();
  }

  return null;
}

function createAdminToken(payload: AdminJwtPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: `${ADMIN_SESSION_MAX_AGE}s` });
}

function hashRecoveryCode(code: string) {
  return createHash('sha256')
    .update(`${getJwtSecret()}:${code}`)
    .digest('hex');
}

function generateRecoveryCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

async function sendRecoveryEmail(destination: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getRecoverySender();

  if (!apiKey || !from) {
    throw new Error('EMAIL_RECOVERY_NOT_CONFIGURED');
  }

  const subject = `${SITE_NAME} admin security code`;
  const text = [
    `Your ${SITE_NAME} admin security code is ${code}.`,
    '',
    `This code expires in ${EMAIL_CODE_TTL_MINUTES} minutes.`,
    `If you did not request this, you can ignore this email.`,
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6efe6;padding:32px;color:#2c2019;">
      <div style="max-width:520px;margin:0 auto;background:#fffaf4;border-radius:20px;padding:32px;border:1px solid rgba(96,62,41,0.14);">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#8a5b3f;">${SITE_NAME} Admin Security</p>
        <h1 style="margin:0 0 14px;font-size:28px;font-weight:700;">Verification code</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;">Use the code below to create or reset your admin password.</p>
        <div style="display:inline-block;padding:16px 22px;border-radius:16px;background:#2c2019;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.32em;">
          ${code}
        </div>
        <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#5d4639;">This code expires in ${EMAIL_CODE_TTL_MINUTES} minutes. If you did not request it, you can ignore this email.</p>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [destination],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || 'EMAIL_RECOVERY_SEND_FAILED');
  }
}

async function resolveSeedProfile() {
  const settings = await getAdminSettings();

  const email = normalizeEmail(process.env.ADMIN_EMAIL || settings.adminProfile.email);
  const phone = normalizePhoneNumber(process.env.ADMIN_PHONE || settings.adminProfile.phone || '');
  const username = normalizeUsername(process.env.ADMIN_USERNAME);
  const bootstrapPassword = String(process.env.ADMIN_PASSWORD || '').trim();

  return {
    email: email || 'admin@furniturelele.local',
    phone: phone || '',
    username,
    bootstrapPassword:
      bootstrapPassword && bootstrapPassword.toLowerCase() !== 'admin'
        ? bootstrapPassword
        : '',
  };
}

async function findAdminByIdentifier(identifier: string) {
  const normalizedEmail = normalizeEmail(identifier);
  if (normalizedEmail) {
    return AdminAccount.findOne({ email: normalizedEmail, active: true });
  }

  const normalizedPhone = normalizePhoneNumber(identifier);
  if (normalizedPhone) {
    return AdminAccount.findOne({ phone: normalizedPhone, active: true });
  }

  const normalizedUsername = normalizeUsername(identifier);
  if (normalizedUsername) {
    return AdminAccount.findOne({ username: normalizedUsername, active: true });
  }

  return null;
}

function buildEmailRecoveryOption(email: string): AdminRecoveryOption {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return {
      available: false,
      maskedDestination: '',
      reason: 'No admin email is configured yet.',
    };
  }

  if (!isUsableRecoveryEmail(normalizedEmail)) {
    return {
      available: false,
      maskedDestination: maskEmail(normalizedEmail),
      reason: 'Set a real admin email address before using email recovery.',
    };
  }

  if (!process.env.RESEND_API_KEY?.trim() || !getRecoverySender()) {
    return {
      available: false,
      maskedDestination: maskEmail(normalizedEmail),
      reason: 'Email delivery is not configured yet.',
    };
  }

  return {
    available: true,
    maskedDestination: maskEmail(normalizedEmail),
    reason: '',
  };
}

function buildPhoneRecoveryOption(phone?: string | null): AdminRecoveryOption {
  const normalizedPhone = normalizePhoneNumber(phone || '');
  if (!normalizedPhone) {
    return {
      available: false,
      maskedDestination: '',
      reason: 'No admin contact number is configured yet.',
    };
  }

  if (!isPhoneOtpConfigured()) {
    return {
      available: false,
      maskedDestination: maskPhone(normalizedPhone),
      reason: 'Phone OTP delivery is not configured yet.',
    };
  }

  return {
    available: true,
    maskedDestination: maskPhone(normalizedPhone),
    reason: '',
  };
}

async function markAdminLastLogin(adminId: string) {
  try {
    await AdminAccount.updateOne({ _id: adminId }, { $set: { lastLoginAt: new Date() } });
  } catch {
    // Best-effort metadata update.
  }
}

export async function ensureAdminAccount() {
  await dbConnect();

  const seed = await resolveSeedProfile();
  const existing = await AdminAccount.findOne({}).sort({ createdAt: 1 });
  if (existing) {
    let dirty = false;

    if (!existing.username && seed.username) {
      existing.username = seed.username;
      dirty = true;
    }

    if (!existing.password && seed.bootstrapPassword) {
      existing.password = seed.bootstrapPassword;
      existing.passwordUpdatedAt = new Date();
      dirty = true;
    }

    if (dirty) {
      await existing.save();
    }

    return existing;
  }

  try {
    const account = await AdminAccount.create({
      username: seed.username || undefined,
      email: seed.email,
      phone: seed.phone || undefined,
      password: seed.bootstrapPassword || undefined,
      active: true,
      passwordUpdatedAt: seed.bootstrapPassword ? new Date() : null,
    });

    return account;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const recovered = await AdminAccount.findOne({}).sort({ createdAt: 1 });
      if (recovered) {
        return recovered;
      }
    }

    throw error;
  }
}

export async function syncAdminContactProfile(profile: { email?: string; phone?: string }) {
  const admin = await ensureAdminAccount();
  const nextEmail = normalizeEmail(profile.email || '') || admin.email;
  const nextPhone = normalizePhoneNumber(profile.phone || '') || undefined;

  let dirty = false;

  if (nextEmail && nextEmail !== admin.email) {
    admin.email = nextEmail;
    dirty = true;
  }

  if ((admin.phone || undefined) !== nextPhone) {
    admin.phone = nextPhone;
    dirty = true;
  }

  if (dirty) {
    await admin.save();
  }

  return admin;
}

export async function getAdminAuthStatus(): Promise<AdminAuthStatus> {
  const admin = await ensureAdminAccount();
  const emailRecovery = buildEmailRecoveryOption(admin.email);
  const phoneRecovery = buildPhoneRecoveryOption(admin.phone);
  const hasPassword = Boolean(admin.password);

  let guidance = '';
  if (!hasPassword && !emailRecovery.available && !phoneRecovery.available) {
    guidance =
      'No admin password or recovery method is configured yet. For local setup, add JWT_SECRET, ADMIN_USERNAME, and ADMIN_PASSWORD to .env.local, then restart the dev server. You can configure Resend or Twilio recovery later.';
  } else if (hasPassword && !emailRecovery.available && !phoneRecovery.available) {
    guidance = 'Password reset is unavailable until you configure admin email or phone recovery.';
  }

  return {
    hasPassword,
    passwordPolicy: buildPasswordPolicyMessage(),
    guidance,
    recovery: {
      email: emailRecovery,
      phone: phoneRecovery,
    },
  };
}

export async function verifyAdmin(request?: NextRequest): Promise<AdminSessionUser | null> {
  try {
    const token =
      request?.cookies.get(ADMIN_SESSION_COOKIE)?.value ??
      (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, getJwtSecret()) as AdminJwtPayload;
    if (!decoded.adminId || decoded.scope !== 'admin') {
      return null;
    }

    await dbConnect();

    const admin = await AdminAccount.findOne({
      _id: decoded.adminId,
      active: true,
    })
      .select('_id email phone username')
      .lean();

    if (!admin) {
      return null;
    }

    return {
      adminId: String(admin._id),
      email: String(admin.email || ''),
      phone: typeof admin.phone === 'string' ? admin.phone : undefined,
      username: typeof admin.username === 'string' ? admin.username : undefined,
    };
  } catch {
    return null;
  }
}

export async function adminMiddleware(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function login(identifier: string, password: string) {
  await ensureAdminAccount();

  const admin = await findAdminByIdentifier(identifier);
  if (!admin?.password) {
    return null;
  }

  const valid = await bcrypt.compare(String(password || ''), admin.password);
  if (!valid) {
    return null;
  }

  const token = createAdminToken({
    adminId: String(admin._id),
    email: admin.email,
    scope: 'admin',
  });

  await markAdminLastLogin(String(admin._id));
  return token;
}

export async function requestAdminPasswordCode(channel: AdminChannel) {
  const admin = await ensureAdminAccount();

  if (channel === 'phone') {
    const phoneRecovery = buildPhoneRecoveryOption(admin.phone);
    if (!phoneRecovery.available) {
      throw new Error('PHONE_RECOVERY_UNAVAILABLE');
    }

    await sendPhoneOtp(String(admin.phone || ''));

    return {
      maskedDestination: phoneRecovery.maskedDestination,
      channel,
    };
  }

  const emailRecovery = buildEmailRecoveryOption(admin.email);
  if (!emailRecovery.available) {
    throw new Error('EMAIL_RECOVERY_UNAVAILABLE');
  }

  const code = generateRecoveryCode();
  const expiresAt = new Date(Date.now() + EMAIL_CODE_TTL_MINUTES * 60 * 1000);

  await AdminRecoveryCode.deleteMany({
    adminId: admin._id,
    channel: 'email',
    purpose: 'password-recovery',
  });

  await AdminRecoveryCode.create({
    adminId: admin._id,
    channel: 'email',
    purpose: 'password-recovery',
    destination: admin.email,
    codeHash: hashRecoveryCode(code),
    expiresAt,
  });

  try {
    await sendRecoveryEmail(admin.email, code);
  } catch (error) {
    await AdminRecoveryCode.deleteMany({
      adminId: admin._id,
      channel: 'email',
      purpose: 'password-recovery',
    });
    throw error;
  }

  return {
    maskedDestination: emailRecovery.maskedDestination,
    channel,
  };
}

export async function updateAdminPassword(channel: AdminChannel, code: string, nextPassword: string) {
  const passwordError = validateAdminPassword(nextPassword);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const normalizedCode = String(code || '').replace(/\D/g, '').slice(0, 6);
  if (normalizedCode.length !== 6) {
    throw new Error('Enter the 6-digit verification code.');
  }

  const admin = await ensureAdminAccount();

  if (channel === 'phone') {
    const phoneRecovery = buildPhoneRecoveryOption(admin.phone);
    if (!phoneRecovery.available) {
      throw new Error('PHONE_RECOVERY_UNAVAILABLE');
    }

    await verifyPhoneOtp(String(admin.phone || ''), normalizedCode);
  } else {
    const record = await AdminRecoveryCode.findOne({
      adminId: admin._id,
      channel: 'email',
      purpose: 'password-recovery',
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record || record.codeHash !== hashRecoveryCode(normalizedCode)) {
      throw new Error('INVALID_RECOVERY_CODE');
    }

    record.usedAt = new Date();
    await record.save();
  }

  admin.password = nextPassword;
  admin.passwordUpdatedAt = new Date();
  await admin.save();

  const token = createAdminToken({
    adminId: String(admin._id),
    email: admin.email,
    scope: 'admin',
  });

  await markAdminLastLogin(String(admin._id));

  return {
    token,
    admin: {
      adminId: String(admin._id),
      email: admin.email,
      phone: admin.phone,
      username: admin.username,
    },
  };
}

export function setAdminSession(cookieStore: CookieStore, token: string) {
  cookieStore.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
}

export function clearAdminSession(cookieStore: CookieStore) {
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });
}
