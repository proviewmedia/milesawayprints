import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About — Miles Away Prints',
  description:
    'Miles Away Prints designs custom location art — stadiums, airports, marathons, golf courses, city streets, and skylines — printed on archival fine-art paper and shipped worldwide.',
};

export default function AboutPage() {
  return (
    <>
      <NavbarShell />

      {/* Hero */}
      <section className="pt-28 md:pt-32">
        <div className="bg-soft">
          <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-ink leading-[1.02] mb-6">
                About
              </h1>
              <p className="text-base md:text-lg text-ink leading-relaxed max-w-md">
                Miles Away Prints is for the places that matter. The first round
                you walked. The stadium where you watched it happen. The city
                you couldn&apos;t shake. We map them, print them, and send them
                home.
              </p>
            </div>

            <div className="bg-paper aspect-[5/4] flex items-center justify-center">
              <span className="text-[11px] uppercase tracking-wider text-mid">
                Lifestyle photo placeholder
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-28">
        <div className="max-w-[800px] mx-auto px-6 space-y-6 text-base md:text-lg leading-relaxed text-ink">
          <p>
            Miles Away Prints started on Etsy with a few hand-drawn airport
            diagrams and a hunch — that the places people travel to are the
            places they want to remember.
          </p>
          <p>
            The shop grew from there. Golf courses came next, then stadiums,
            marathons, city street maps, and skyline silhouettes. Each design
            is built to feel like art, not data — minimalist, well-spaced,
            quietly typographic. The kind of print you don&apos;t mind looking
            at every morning.
          </p>
          <p>
            Every order is made-to-order. Physical prints are produced on
            archival fine-art paper through fulfillment partners who handle
            framing, packaging, and worldwide shipping. Digital downloads
            arrive immediately, ready to print at any size.
          </p>
          <p>
            If you&apos;ve got a place that means something — a finish line, a
            tee box, a terminal, a corner of a city — there&apos;s a print for
            it. And if there isn&apos;t, we&apos;ll design one.
          </p>
        </div>
      </section>

      {/* Values row */}
      <section className="border-y border-border bg-paper">
        <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              title: 'Made-to-order',
              desc: 'Nothing sits in a warehouse. Every print is produced and packed when ordered, on archival fine-art paper.',
            },
            {
              title: 'Designed in-house',
              desc: 'Every print type — airports, courses, skylines, circuits, marathons — is drawn from scratch in a single visual system.',
            },
            {
              title: 'Shipped worldwide',
              desc: 'Tracked, insured, and packed flat. Free U.S. shipping over $75. International orders ship through our printing partners.',
            },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="text-[18px] font-medium text-ink mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-mid leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-ink text-paper">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] mb-5">
            Make your place.
          </h2>
          <p className="text-paper/70 mb-9 max-w-md mx-auto">
            Browse the collection or start a custom print of any place in the
            world.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium text-sm hover:bg-soft transition-colors"
            >
              Shop the collection
            </Link>
            <Link
              href="/prints/golf"
              className="inline-flex items-center justify-center gap-2 border border-paper/30 text-paper px-7 py-3.5 rounded-full font-medium text-sm hover:bg-paper/10 transition-colors"
            >
              Create custom
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
