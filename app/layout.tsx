import './globals.css';
import 'lenis/dist/lenis.css';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import SmoothScrolling from '@/components/SmoothScrolling';
import ThemeProvider from '@/components/ThemeProvider';
import MaintenanceGate from '@/components/MaintenanceGate';
import PerformanceMonitoring from '@/components/PerformanceMonitoring';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { UserProvider } from '@/context/UserContext';

export const metadata = {
  title: 'Luxe Decor | Sculpted Furniture for Refined Interiors',
  description:
    'Premium sofas, recliners, and accent pieces designed with warm materials, gallery-level styling, and modern comfort.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-theme-ivory text-theme-walnut antialiased">
        <PerformanceMonitoring />
        <ThemeProvider>
          <MaintenanceGate />
          <UserProvider>
            <WishlistProvider>
              <CartProvider>
                <SmoothScrolling>
                  <Navbar />
                  {children}
                </SmoothScrolling>
              </CartProvider>
            </WishlistProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
