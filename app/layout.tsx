import './globals.css';
import SmoothScrolling from '@/components/SmoothScrolling';
import ThemeProvider from '@/components/ThemeProvider';

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
          <SmoothScrolling>{children}</SmoothScrolling>
        </ThemeProvider>
      </body>
    </html>
  );
}
