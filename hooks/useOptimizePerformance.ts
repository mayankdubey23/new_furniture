import { useEffect, useState } from 'react';

type EffectiveConnectionType = '4g' | '3g' | '2g' | 'slow-2g';

interface ConnectionInfo {
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NavigatorConnectionLike extends EventTarget {
  effectiveType?: EffectiveConnectionType;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

function getConnectionInfo(): ConnectionInfo | null {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return null;
  }

  const connection = (navigator as Navigator & { connection?: NavigatorConnectionLike }).connection;
  if (!connection) {
    return null;
  }

  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

export function useOptimizePerformance() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(getConnectionInfo);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: NavigatorConnectionLike };
    const connection = nav.connection;
    const updateConnection = () => setConnectionInfo(getConnectionInfo());

    if (connection) {
      connection.addEventListener('change', updateConnection);
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      connection?.removeEventListener('change', updateConnection);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const isSlowConnection =
    connectionInfo?.saveData ||
    connectionInfo?.effectiveType === 'slow-2g' ||
    connectionInfo?.effectiveType === '2g' ||
    connectionInfo?.effectiveType === '3g' ||
    false;

  const shouldReduceAnimations = prefersReducedMotion || isSlowConnection;

  return {
    connectionInfo,
    prefersReducedMotion,
    isSlowConnection,
    shouldReduceAnimations,
  };
}
