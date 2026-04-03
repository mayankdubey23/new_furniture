'use client';

import Script from 'next/script';

export default function PerformanceMonitoring() {
  return (
    <>
      {process.env.NODE_ENV === 'production' && (
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Core Web Vitals monitoring
              if ('web-vital' in window || 'PerformanceObserver' in window) {
                // Monitor Core Web Vitals
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    console.log(\`\${entry.name}: \${entry.value}ms\`);
                  }
                });
                
                try {
                  observer.observe({ 
                    entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
                  });
                } catch (e) {
                  // Observer not supported
                }
              }
              
              // Resource timing monitoring
              window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource');
                const slow = resources.filter(r => r.duration > 3000);
                if (slow.length > 0) {
                  console.warn('Slow resources:', slow.map(r => r.name));
                }
              }, { once: true });
            `,
          }}
        />
      )}
    </>
  );
}
