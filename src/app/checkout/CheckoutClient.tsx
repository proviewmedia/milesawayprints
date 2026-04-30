'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutForm from './CheckoutForm';

interface CheckoutClientProps {
  initialCountry?: string;
  navbarCountry?: string;
}

export default function CheckoutClient({
  initialCountry,
  navbarCountry,
}: CheckoutClientProps) {
  return (
    <>
      <Navbar defaultCountry={navbarCountry} />
      <CheckoutForm initialCountry={initialCountry} />
      <Footer />
    </>
  );
}
