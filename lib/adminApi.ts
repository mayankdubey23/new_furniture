function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function readEntityId(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (isRecord(value)) {
    return readString(value._id ?? value.id);
  }

  return '';
}

export function unwrapApiData<T>(value: unknown, fallback: T): T {
  if (isRecord(value) && 'data' in value) {
    return (value.data as T) ?? fallback;
  }

  return value === undefined || value === null ? fallback : (value as T);
}

export function unwrapApiArray<T>(value: unknown) {
  const data = unwrapApiData<unknown>(value, []);
  return Array.isArray(data) ? (data as T[]) : [];
}

export function extractApiError(value: unknown, fallback = 'Request failed.') {
  if (isRecord(value)) {
    const message = readString(value.error ?? value.message ?? value.reason);
    if (message) {
      return message;
    }
  }

  return fallback;
}

export { isRecord };
