import { Poppins } from 'next/font/google';
import './globals.css';
import SmoothScrolling from '@/components/SmoothScrolling'; // Smooth Scrolling Import
import ThemeProvider from '@/components/ThemeProvider';

// Premium Font setup
const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Luxe Decor | Premium Furniture',
  description: 'Redefining your living space with luxury sofas, recliners, and pouffes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Font aur global styles body par apply ho rahe hain */}
      <body className={`${poppins.className} bg-theme-beige text-theme-brown dark:bg-[#12100d] dark:text-theme-beige antialiased`}>


        <ThemeProvider>
          {/* Smooth Scrolling Wrapper */}  
        <SmoothScrolling>
          {children}
        </SmoothScrolling>
        </ThemeProvider>
        
      </body>
    </html>
  );
}
