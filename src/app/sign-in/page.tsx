import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignInForm from './SignInForm';

export const metadata: Metadata = {
  title: 'Sign in — Miles Away Prints',
  description: 'Sign in to view your orders, track shipments, and download digital files.',
};

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <section className="pt-32 md:pt-40 pb-20 min-h-[70vh]">
        <div className="max-w-[440px] mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink leading-[1.05] mb-3 text-center">
            Sign in
          </h1>
          <p className="text-mid text-center mb-10">
            Enter your email and we&apos;ll send you a magic link.
          </p>
          <SignInForm />
        </div>
      </section>
      <Footer />
    </>
  );
}
