'use client';
import { ReactLenis } from '@studio-freight/react-lenis';

export default function SmoothScrolling({ children }) {
  return (
    // lerp: 0.07 ekdum premium aur luxury feel deta hai (jitna kam, utna smooth)
    <ReactLenis root options={{ lerp: 0.07, duration: 1.5, smoothTouch: false }}>
      {children}
    </ReactLenis>
  );
}