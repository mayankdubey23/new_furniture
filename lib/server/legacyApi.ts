import { NextRequest, NextResponse } from 'next/server';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function cleanBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

export function cleanNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const normalized = Number(value);
    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return fallback;
}

export function cleanStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanString(entry)).filter(Boolean);
  }

  const single = cleanString(value);
  if (!single) {
    return [];
  }

  if (single.includes(',')) {
    return single
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [single];
}

export function extractFiles(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  }

  return value instanceof File && value.size > 0 ? [value] : [];
}

export function getId(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isRecord(value)) {
    return cleanString(value._id ?? value.id);
  }

  return '';
}

export function toIsoDateString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed.toISOString();
    }
  }

  return '';
}

export function noStoreJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...(init?.headers || {}),
    },
  });
}

export function legacySuccess(data: unknown, init?: ResponseInit) {
  return noStoreJson(
    {
      result: 'Done',
      data,
    },
    init
  );
}

export function legacyMessage(
  message: string,
  init?: ResponseInit,
  key: 'message' | 'reason' = 'message'
) {
  return noStoreJson(
    {
      result: 'Done',
      [key]: message,
    },
    init
  );
}

export function legacyError(message: string, status = 400) {
  return noStoreJson(
    {
      result: 'Failed',
      error: message,
    },
    { status }
  );
}

export async function readRequestData(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = String(request.headers.get('content-type') || '').toLowerCase();

  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    const formData = await request.formData();
    const result: Record<string, unknown> = {};

    for (const [key, rawValue] of formData.entries()) {
      const value =
        rawValue instanceof File && rawValue.size === 0 && !rawValue.name ? '' : rawValue;
      const existing = result[key];

      if (existing === undefined) {
        result[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing, value];
      }
    }

    return result;
  }

  if (contentType.includes('application/json') || contentType.includes('+json')) {
    try {
      const data = (await request.json()) as unknown;
      return isRecord(data) ? data : {};
    } catch {
      return {};
    }
  }

  return {};
}
