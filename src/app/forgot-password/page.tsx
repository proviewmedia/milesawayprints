import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset your password — Miles Away Prints',
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
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink leading-[1.05] mb-3 text-center">
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
