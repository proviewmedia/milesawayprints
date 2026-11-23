import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SERVICE_AREAS } from '@/data/locations';

export const metadata: Metadata = {
  title: 'Where We Print: Houston, College Station, Las Vegas, Boston, Florida',
  description:
    'The INQ Press prints custom shirts, hats, stickers, signs, and prints for Houston, College Station, Las Vegas, Boston, Rhode Island, and Florida, and ships everywhere in the US.',
  alternates: { canonical: '/custom-printing' },
  openGraph: { url: '/custom-printing', title: 'Where We Print | The INQ Press' },
};

export default function ServiceAreasPage() {
  return (
    <>
      <NavbarShell />
      <section className="bg-ink text-paper pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <Breadcrumbs items={[{ name: 'Where we print', href: '/custom-printing' }]} />
          <h1 className="display text-[13vw] md:text-8xl mb-6">Where we print</h1>
          <p className="text-base md:text-xl text-paper/75 max-w-2xl leading-relaxed">
            Designed in Las Vegas and shipped everywhere in the US. These are the places we work with most.
          </p>
        </div>
      </section>
      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink border border-ink">
            {SERVICE_AREAS.map((a) => (
              <li key={a.slug} className="bg-paper">
                <Link
                  href={`/custom-printing/${a.slug}`}
                  className="group flex flex-col h-full min-h-[200px] p-6 md:p-8 hover:bg-ink hover:text-paper transition-colors"
                >
                  <span className="font-display font-black uppercase text-3xl tracking-tight leading-none mb-3">
                    {a.name}
                  </span>
                  <span className="text-sm text-mid group-hover:text-paper/70 leading-relaxed">{a.intro}</span>
                  <span className="mt-auto pt-6 inline-flex items-center gap-2 text-sm font-bold">
                    Custom printing in {a.name}
                    <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </>
  );
}
