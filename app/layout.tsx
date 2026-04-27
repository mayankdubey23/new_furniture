import './globals.css';
import 'lenis/dist/lenis.css';
import Navbar from '@/components/Navbar';
import CushionCascade from '@/components/decor/CushionCascade';
import SmoothScrolling from '@/components/SmoothScrolling';
import ThemeProvider from '@/components/ThemeProvider';
import MaintenanceGate from '@/components/MaintenanceGate';
import PerformanceMonitoring from '@/components/PerformanceMonitoring';
import ChatbotWidget from '@/components/ChatbotWidget';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { UserProvider } from '@/context/UserContext';
import { getStorefrontCollectionLinks } from '@/lib/productStore';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
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
                      <ChatbotWidget />
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
