import { useSyncExternalStore } from 'react';

export type LayoutMode = 'desktop' | 'tablet' | 'mobile';

function subscribeViewport(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
}

function getViewportMode(): LayoutMode {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  if (window.innerWidth < 768) {
    return 'mobile';
  }

  if (window.innerWidth < 1024) {
    return 'tablet';
  }

  return 'desktop';
}

function getServerViewportMode(): LayoutMode {
  return 'desktop';
}

export function useViewportMode() {
  return useSyncExternalStore(
    subscribeViewport,
    getViewportMode,
    getServerViewportMode
  );
}
