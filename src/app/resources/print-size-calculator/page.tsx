import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import PrintSizeCalculator from './PrintSizeCalculator';

export const metadata: Metadata = {
  title: 'Print Size Calculator: How Big Can My Image Print?',
  description:
    'Enter your image size in pixels to see the largest size it can print sharp, and check the DPI for any print size.',
  alternates: { canonical: '/resources/print-size-calculator' },
};

export default function PrintSizeCalculatorPage() {
  return (
    <>
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-[1000px] mx-auto px-6">
          <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-paper/60 hover:text-paper mb-8">
            <ArrowLeft size={16} aria-hidden="true" />
            All resources
          </Link>
          <p className="eyebrow text-paper/60 mb-5">Tool</p>
          <h1 className="display text-[11vw] md:text-7xl mb-6">Print size calculator</h1>
          <p className="text-base md:text-lg text-paper/75 max-w-xl leading-relaxed">
            Find out how large your image can print before it gets blurry. Everything runs in your browser, nothing is
            uploaded.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-[1000px] mx-auto px-6">
          <PrintSizeCalculator />

          <p className="text-sm text-mid mt-10 max-w-2xl leading-relaxed">
            This works for photos and other pixel-based images. Vector files (AI, EPS, SVG) can print at any size. New to
            resolution? Read{' '}
            <Link href="/resources/preparing-artwork" className="text-ink underline underline-offset-2">
              how to prepare artwork for print
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
