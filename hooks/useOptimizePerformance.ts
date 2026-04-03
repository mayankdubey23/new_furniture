import { useEffect, useState } from 'react';

interface ConnectionInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export function useOptimizePerformance() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check network connection
    if ('connection' in navigator) {
      const nav = navigator as any;
      setConnectionInfo({
        effectiveType: nav.connection?.effectiveType || '4g',
        downlink: nav.connection?.downlink || 0,
        rtt: nav.connection?.rtt || 0,
        saveData: nav.connection?.saveData || false,
      });

      nav.connection?.addEventListener('change', () => {
        setConnectionInfo({
          effectiveType: nav.connection?.effectiveType || '4g',
          downlink: nav.connection?.downlink || 0,
          rtt: nav.connection?.rtt || 0,
          saveData: nav.connection?.saveData || false,
        });
      });
    }

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isSlowConnection = 
    connectionInfo?.saveData || 
    connectionInfo?.effectiveType === 'slow-2g' ||
    connectionInfo?.effectiveType === '2g' ||
    connectionInfo?.effectiveType === '3g';

  const shouldReduceAnimations = prefersReducedMotion || isSlowConnection;

  return {
    connectionInfo,
    prefersReducedMotion,
    isSlowConnection,
    shouldReduceAnimations,
  };
}
