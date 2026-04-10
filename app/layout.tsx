import './globals.css';
import 'lenis/dist/lenis.css';
import Navbar from '@/components/Navbar';
import CushionCascade from '@/components/decor/CushionCascade';
import SmoothScrolling from '@/components/SmoothScrolling';
import ThemeProvider from '@/components/ThemeProvider';
import MaintenanceGate from '@/components/MaintenanceGate';
import PerformanceMonitoring from '@/components/PerformanceMonitoring';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { UserProvider } from '@/context/UserContext';
import { getStorefrontCollectionLinks } from '@/lib/productStore';

export const metadata = {
  title: 'Luxe Decor | Sculpted Furniture for Refined Interiors',
  description:
    'Premium furniture collections designed with warm materials, gallery-level styling, and modern comfort.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getStorefrontCollectionLinks();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-theme-ivory text-theme-walnut antialiased">
        <PerformanceMonitoring />
        <ThemeProvider>
          <MaintenanceGate />
          <UserProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="relative isolate">
                  <CushionCascade />
                  <div className="relative z-10">
                    <SmoothScrolling>
                      <Navbar collections={collections} />
                      {children}
                    </SmoothScrolling>
                  </div>
                </div>
              </CartProvider>
            </WishlistProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
