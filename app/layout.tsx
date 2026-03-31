import './globals.css';
import SmoothScrolling from '@/components/SmoothScrolling';
import ThemeProvider from '@/components/ThemeProvider';
import Link from 'next/link';

export const metadata = {
  title: 'Luxe Decor | Sculpted Furniture for Refined Interiors',
  description:
    'Premium sofas, recliners, and accent pieces designed with warm materials, gallery-level styling, and modern comfort.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-theme-ivory text-theme-walnut antialiased">
        <ThemeProvider>
          <head>
            <link rel="preload" href="/sofa.glb" as="fetch" type="model/gltf-binary" crossOrigin="anonymous" />
            <link rel="preload" href="/rocking-chair.glb" as="fetch" type="model/gltf-binary" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
          </head>
          <SmoothScrolling>{children}</SmoothScrolling>
        </ThemeProvider>
      </body>
    </html>
  );
}
