import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset your password',
  robots: { index: false, follow: false },
  description:
    'Forgot your password? Enter your email and we\'ll send a reset link.',
  alternates: { canonical: '/forgot-password' },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <NavbarShell />
      <section className="pt-32 md:pt-40 pb-20 min-h-[70vh]">
        <div className="max-w-[440px] mx-auto px-6">
          <h1 className="display text-4xl md:text-5xl text-ink pt-3 mb-3 text-center">
            Reset your password
          </h1>
          <p className="text-mid text-center mb-10">
            Enter the email tied to your account and we&apos;ll send you a link to set a new password.
          </p>
          <ForgotPasswordForm />
        </div>
      </section>
      <Footer />
    </>
  );
}
