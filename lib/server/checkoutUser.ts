import { cookies } from 'next/headers';
import User from '@/models/User';
import { normalizePhoneNumber } from '@/lib/phoneOtp';
import { createUserToken, setUserSession } from '@/lib/userAuth';

export interface CheckoutSessionResult {
  authenticated: boolean;
  created: boolean;
  userId: string;
  name: string;
  email: string;
}

interface CheckoutCustomerIdentity {
  name?: string;
  email?: string;
  phone?: string;
}

function normalizeEmail(value: string | undefined | null) {
  return String(value || '').trim().toLowerCase();
}

function buildFallbackName(email: string) {
  const localPart = email.split('@')[0] || 'customer';
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function ensureCheckoutUserSession(
  customer: CheckoutCustomerIdentity
): Promise<CheckoutSessionResult | null> {
  const email = normalizeEmail(customer.email);

  if (!email) {
    return null;
  }

  const name = String(customer.name || '').trim() || buildFallbackName(email);
  const normalizedPhone = normalizePhoneNumber(String(customer.phone || ''));

  let user = await User.findOne({ email });
  let created = false;

  if (!user) {
    let phoneToPersist: string | undefined;

    if (normalizedPhone) {
      const phoneOwner = await User.findOne({ phone: normalizedPhone }).select('_id').lean();
      if (!phoneOwner) {
        phoneToPersist = normalizedPhone;
      }
    }

    user = await User.create({
      name,
      email,
      ...(phoneToPersist ? { phone: phoneToPersist } : {}),
    });
    created = true;
  } else {
    let shouldSave = false;

    if (!String(user.name || '').trim() && name) {
      user.name = name;
      shouldSave = true;
    }

    if (!user.phone && normalizedPhone) {
      const phoneOwner = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: user._id },
      })
        .select('_id')
        .lean();

      if (!phoneOwner) {
        user.phone = normalizedPhone;
        shouldSave = true;
      }
    }

    if (user.active === false) {
      user.active = true;
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }
  }

  const token = createUserToken(user._id.toString(), user.name, user.email);
  const cookieStore = await cookies();
  setUserSession(cookieStore, token);

  return {
    authenticated: true,
    created,
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
