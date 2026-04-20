export const STOREFRONT_SYNC_CHANNEL = 'new-furniture-storefront-sync';
export const STOREFRONT_SYNC_STORAGE_KEY = 'new-furniture-storefront-sync-event';

export interface StorefrontSyncPayload {
  reason: string;
  timestamp: number;
}

export function announceStorefrontUpdate(reason: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: StorefrontSyncPayload = {
    reason,
    timestamp: Date.now(),
  };
  const serializedPayload = JSON.stringify(payload);

  try {
    window.localStorage.setItem(STOREFRONT_SYNC_STORAGE_KEY, serializedPayload);
  } catch {
    // Ignore storage failures and continue with the broadcast fallback.
  }

  if (typeof window.BroadcastChannel === 'function') {
    const channel = new window.BroadcastChannel(STOREFRONT_SYNC_CHANNEL);
    channel.postMessage(payload);
    channel.close();
  }
}
