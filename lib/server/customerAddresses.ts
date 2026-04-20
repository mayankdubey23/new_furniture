import dbConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import { buildCustomerAddress } from '@/lib/addressDirectory';
import { cleanString, getId, toIsoDateString } from '@/lib/server/legacyApi';
import type { SavedCustomerAddress } from '@/lib/commerce';

interface AddressInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  country?: unknown;
  state?: unknown;
  city?: unknown;
  pincode?: unknown;
  pin?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  address?: unknown;
  isDefault?: unknown;
}

export function normalizeCustomerAddressInput(input: AddressInput) {
  const addressLine1 = cleanString(input.addressLine1 ?? input.address);
  const addressLine2 = cleanString(input.addressLine2);
  const pincode = cleanString(input.pincode ?? input.pin).replace(/\D/g, '').slice(0, 6);
  const combinedAddress = buildCustomerAddress(addressLine1, addressLine2);

  return {
    name: cleanString(input.name),
    email: cleanString(input.email).toLowerCase(),
    phone: cleanString(input.phone),
    country: cleanString(input.country).toUpperCase() || 'IN',
    state: cleanString(input.state),
    city: cleanString(input.city),
    pincode,
    addressLine1,
    addressLine2,
    address: combinedAddress || cleanString(input.address),
    isDefault: Boolean(input.isDefault),
  };
}

export function serializeCustomerAddress(value: unknown): SavedCustomerAddress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const addressLine1 = cleanString(source.addressLine1 ?? source.address);
  const addressLine2 = cleanString(source.addressLine2);
  const address = buildCustomerAddress(addressLine1, addressLine2) || cleanString(source.address);

  return {
    id: getId(source._id ?? source.id),
    name: cleanString(source.name),
    email: cleanString(source.email).toLowerCase(),
    phone: cleanString(source.phone),
    country: cleanString(source.country).toUpperCase() || 'IN',
    state: cleanString(source.state),
    city: cleanString(source.city),
    pincode: cleanString(source.pincode ?? source.pin),
    addressLine1,
    addressLine2,
    address,
    isDefault: Boolean(source.isDefault),
    ...(toIsoDateString(source.createdAt) ? { createdAt: toIsoDateString(source.createdAt) } : {}),
    ...(toIsoDateString(source.updatedAt) ? { updatedAt: toIsoDateString(source.updatedAt) } : {}),
  };
}

export async function listCustomerAddresses(userId: string) {
  await dbConnect();

  const addresses = await Address.find({ user: userId })
    .sort({ isDefault: -1, updatedAt: -1, createdAt: -1 })
    .lean();

  return addresses
    .map((address) => serializeCustomerAddress(address))
    .filter((address): address is SavedCustomerAddress => Boolean(address));
}

export async function saveCustomerAddress(
  userId: string,
  input: AddressInput,
  options?: { id?: string | null }
) {
  await dbConnect();

  const normalized = normalizeCustomerAddressInput(input);

  if (
    !normalized.name ||
    !normalized.email ||
    !normalized.phone ||
    !normalized.address ||
    !normalized.city ||
    !normalized.state ||
    !normalized.pincode
  ) {
    throw new Error('Name, email, phone, address, city, state, and pincode are required.');
  }

  const existingCount = await Address.countDocuments({ user: userId });
  const shouldSetDefault = normalized.isDefault || existingCount === 0;

  if (shouldSetDefault) {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  let record = null;

  if (options?.id) {
    record = await Address.findOne({ _id: options.id, user: userId });
  }

  if (!record) {
    record = await Address.findOne({
      user: userId,
      address: normalized.address,
      city: normalized.city,
      state: normalized.state,
      pin: normalized.pincode,
    });
  }

  if (record) {
    record.name = normalized.name;
    record.email = normalized.email;
    record.phone = normalized.phone;
    record.country = normalized.country;
    record.state = normalized.state;
    record.city = normalized.city;
    record.pin = normalized.pincode;
    record.pincode = normalized.pincode;
    record.addressLine1 = normalized.addressLine1;
    record.addressLine2 = normalized.addressLine2;
    record.address = normalized.address;
    record.isDefault = shouldSetDefault ? true : Boolean(record.isDefault);
    await record.save();
  } else {
    record = await Address.create({
      user: userId,
      name: normalized.name,
      email: normalized.email,
      phone: normalized.phone,
      country: normalized.country,
      state: normalized.state,
      city: normalized.city,
      pin: normalized.pincode,
      pincode: normalized.pincode,
      addressLine1: normalized.addressLine1,
      addressLine2: normalized.addressLine2,
      address: normalized.address,
      isDefault: shouldSetDefault,
    });
  }

  const serialized = serializeCustomerAddress(record.toObject());

  if (!serialized) {
    throw new Error('Failed to save address.');
  }

  return serialized;
}

export async function deleteCustomerAddress(userId: string, addressId: string) {
  await dbConnect();

  const deleted = await Address.findOneAndDelete({ _id: addressId, user: userId });

  if (!deleted) {
    return false;
  }

  if (deleted.isDefault) {
    const replacement = await Address.findOne({ user: userId }).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    if (replacement) {
      replacement.isDefault = true;
      await replacement.save();
    }
  }

  return true;
}
