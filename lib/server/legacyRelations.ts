import { serializeLegacyProduct } from '@/lib/server/legacyProduct';
import {
  cleanBoolean,
  cleanNumber,
  cleanString,
  getId,
  toIsoDateString,
} from '@/lib/server/legacyApi';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function serializeLegacyUser(
  value: unknown,
  options?: {
    includePassword?: boolean;
  }
) {
  if (!isRecord(value)) {
    return null;
  }

  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    name: cleanString(value.name),
    username: cleanString(value.username ?? value.userName),
    email: cleanString(value.email),
    phone: cleanString(value.phone),
    role: cleanString(value.role) || 'Buyer',
    active: cleanBoolean(value.active, true),
    ...(options?.includePassword && cleanString(value.password)
      ? { password: cleanString(value.password) }
      : {}),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

export function serializeLegacyAddress(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    user: isRecord(value.user) ? serializeLegacyUser(value.user) : getId(value.user),
    name: cleanString(value.name),
    email: cleanString(value.email),
    phone: cleanString(value.phone),
    address: cleanString(value.address),
    pin: cleanString(value.pin),
    city: cleanString(value.city),
    state: cleanString(value.state),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

export function serializeLegacyCart(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    user: isRecord(value.user) ? serializeLegacyUser(value.user) : getId(value.user),
    product: isRecord(value.product) ? serializeLegacyProduct(value.product) : getId(value.product),
    color: cleanString(value.color),
    size: cleanString(value.size),
    quantity: cleanNumber(value.quantity, 1),
    total: cleanNumber(value.total, 0),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

export function serializeLegacyWishlist(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    user: isRecord(value.user) ? serializeLegacyUser(value.user) : getId(value.user),
    product: isRecord(value.product) ? serializeLegacyProduct(value.product) : getId(value.product),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

export function serializeLegacyTestimonial(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    user: isRecord(value.user) ? serializeLegacyUser(value.user) : getId(value.user),
    product: isRecord(value.product) ? serializeLegacyProduct(value.product) : getId(value.product),
    message: cleanString(value.message),
    star: cleanNumber(value.star, 0),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}
