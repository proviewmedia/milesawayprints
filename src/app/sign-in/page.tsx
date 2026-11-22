import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import SignInForm from './SignInForm';

export const metadata: Metadata = {
  title: 'Sign in — The INQ Press',
  description: 'Sign in to view your orders, track shipments, and download digital files.',
};

export default function SignInPage() {
  return (
    <>
      <NavbarShell />
      <section className="pt-32 md:pt-40 pb-20 min-h-[70vh]">
        <div className="max-w-[440px] mx-auto px-6">
          <h1 className="display text-4xl md:text-5xl text-ink pt-3 mb-3 text-center">
            Sign in
          </h1>
          <p className="text-mid text-center mb-10">
            Sign in to see your orders, track shipments, and reorder faster.
          </p>
          <SignInForm />
        </div>
      </section>
      <Footer />
    </>
  );
}
