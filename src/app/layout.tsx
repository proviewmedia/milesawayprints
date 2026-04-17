import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: {
    default: 'Miles Away Prints | Custom Location Art Prints',
    template: '%s | Miles Away Prints',
  },
  description:
    'Custom art prints of stadiums, airports, marathon routes, city streets, and golf courses. Personalized with your location, name, and details. Digital downloads and museum-quality physical prints.',
  keywords: [
    'custom prints',
    'stadium art',
    'airport map print',
    'marathon print',
    'golf course print',
    'city map print',
    'personalized art',
    'custom wall art',
  ],
  authors: [{ name: 'Miles Away Prints' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://milesawayprints.com',
    siteName: 'Miles Away Prints',
    title: 'Miles Away Prints | Custom Location Art Prints',
    description:
      'Custom art prints of stadiums, airports, marathon routes, city streets, and golf courses. Personalized and delivered your way.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miles Away Prints | Custom Location Art Prints',
    description: 'Custom art prints of stadiums, airports, marathon routes, city streets, and golf courses.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
