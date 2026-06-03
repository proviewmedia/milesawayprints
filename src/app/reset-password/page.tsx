import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Set a new password — Miles Away Prints',
  description: 'Set a new password for your Miles Away Prints account.',
  alternates: { canonical: '/reset-password' },
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <>
      <NavbarShell />
      <section className="pt-32 md:pt-40 pb-20 min-h-[70vh]">
        <div className="max-w-[440px] mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink leading-[1.05] mb-3 text-center">
            Set a new password
          </h1>
          <p className="text-mid text-center mb-10">
            Pick a new password for your account. Eight characters or more.
          </p>
          <ResetPasswordForm />
        </div>
      </section>
      <Footer />
    </>
  );
}
