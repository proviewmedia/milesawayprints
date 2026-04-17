import Link from 'next/link';
import { ArrowRight, Sparkles, MapPin, Download, Truck, Gift, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrintPreview from '@/components/PrintPreview';
import { PRINT_CONFIGS, PrintType, DEFAULT_GALLERY } from '@/data/prints';
import { supabase } from '@/lib/supabase';

const CATEGORY_ORDER: PrintType[] = ['golf', 'stadium', 'airport', 'marathon', 'city'];

async function getReviews() {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);
  return data ?? [];
}

export default async function HomePage() {
  const reviews = await getReviews();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-soft to-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
                <Sparkles size={14} /> Custom Location Art
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-ink leading-[1.05] mb-6">
                The places that
                <br />
                <span className="text-primary">mean the most</span>
                <br />
                to you.
              </h1>
              <p className="text-lg text-mid mb-8 max-w-md leading-relaxed">
                Custom art prints of stadiums, airports, marathons, city streets, and golf courses — personalized with your details, delivered your way.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/prints/golf" className="btn-primary">
                  Shop Prints <ArrowRight size={16} />
                </Link>
                <Link href="#how" className="btn-secondary">
                  How It Works
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light/40 to-mint-light/40 rounded-3xl blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="pt-8">
                  <WallFrame>
                    <PrintPreview type="golf" values={DEFAULT_GALLERY.golf[0].values} />
                  </WallFrame>
                </div>
                <div className="pb-8">
                  <WallFrame>
                    <PrintPreview type="stadium" values={DEFAULT_GALLERY.stadium[0].values} />
                  </WallFrame>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-white">
        <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Download, label: 'Instant digital delivery', bg: 'bg-primary-light', fg: 'text-primary' },
            { icon: Truck, label: 'Museum-quality printing', bg: 'bg-mint-light', fg: 'text-mint' },
            { icon: Gift, label: 'Perfect for gifts', bg: 'bg-coral-light', fg: 'text-coral' },
            { icon: Star, label: '500+ happy customers', bg: 'bg-warm-light', fg: 'text-warm' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
              <div className={`p-2 rounded-full ${item.bg}`}>
                <item.icon size={16} className={item.fg} />
              </div>
              <span className="text-sm font-medium text-ink">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label">Pick Your Print</div>
            <h2 className="section-title">Five templates. Endless locations.</h2>
            <p className="text-mid max-w-lg mx-auto mt-3">
              Choose a category, customize with your specific location and personalization, and preview it live before you order.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORY_ORDER.map((type) => {
              const cfg = PRINT_CONFIGS[type];
              const sample = DEFAULT_GALLERY[type][0];
              return (
                <Link
                  key={type}
                  href={`/prints/${cfg.slug}`}
                  className="group block bg-white rounded-2xl border border-border p-4 hover:border-primary hover:shadow-[0_12px_36px_rgba(79,109,245,0.12)] hover:-translate-y-1 transition-all duration-300"
                >
                  <WallFrame compact>
                    <PrintPreview type={type} values={sample.values} />
                  </WallFrame>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-ink text-sm">{cfg.detailsLabel}</div>
                      <div className="text-xs text-mid mt-0.5">{cfg.badge}</div>
                    </div>
                    <ArrowRight size={16} className="text-mid group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 md:py-28 bg-soft">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Pick, personalize, preview, enjoy.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', title: 'Pick your print', desc: 'Choose from five categories: stadium, airport, marathon, city, or golf course.', bg: 'bg-primary-light', fg: 'text-primary' },
              { n: '2', title: 'Add your details', desc: 'Enter your location, personalization text, and stats. Optional fields — we fill the gaps.', bg: 'bg-mint-light', fg: 'text-mint' },
              { n: '3', title: 'Preview live', desc: 'See your print come to life with your exact details before you check out.', bg: 'bg-coral-light', fg: 'text-coral' },
              { n: '4', title: 'Enjoy', desc: 'Instant digital download or museum-quality print delivered to your door.', bg: 'bg-warm-light', fg: 'text-warm' },
            ].map((step) => (
              <div key={step.n} className="bg-white rounded-2xl p-6 border border-border">
                <div className={`w-10 h-10 rounded-full ${step.bg} ${step.fg} font-extrabold flex items-center justify-center mb-4`}>
                  {step.n}
                </div>
                <h3 className="font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Section */}
      <section id="gift" className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-gradient-to-br from-coral-light to-warm-light rounded-3xl p-8 md:p-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/70 text-coral px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                <Gift size={14} /> Gifts, simplified
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight mb-4">
                Make it meaningful.
              </h2>
              <p className="text-mid text-lg mb-6 leading-relaxed">
                Every print can be a gift. Add a personal message, have it shipped directly to the recipient, and we&apos;ll leave the price off. Perfect for birthdays, anniversaries, and weddings.
              </p>
              <Link href="/prints/marathon" className="btn-primary">
                Find a Gift <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <WallFrame>
                <PrintPreview type="marathon" values={DEFAULT_GALLERY.marathon[0].values} />
              </WallFrame>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 bg-soft">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Two ways to get your print.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                <Download size={12} /> Digital
              </div>
              <div className="text-4xl font-extrabold text-ink mb-1">From $12</div>
              <p className="text-mid text-sm mb-6">Instant download. Print anywhere, any size.</p>
              <ul className="space-y-2 text-sm text-mid">
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> High-resolution PDF</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Delivered within minutes</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Print as many times as you want</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-primary relative">
              <div className="absolute -top-3 right-6 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                Most Popular
              </div>
              <div className="inline-flex items-center gap-2 bg-mint-light text-mint px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                <Truck size={12} /> Physical
              </div>
              <div className="text-4xl font-extrabold text-ink mb-1">From $25</div>
              <p className="text-mid text-sm mb-6">Museum-quality print. Ready to frame.</p>
              <ul className="space-y-2 text-sm text-mid">
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> 8×10 to 24×36 sizes</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Matte archival paper</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Shipped in protective packaging</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center mb-14">
              <div className="section-label">Reviews</div>
              <h2 className="section-title">What customers are saying.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-6 border border-border">
                  <div className="flex gap-0.5 mb-3 text-warm">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="text-ink text-sm leading-relaxed mb-4">&ldquo;{r.content}&rdquo;</p>
                  <div>
                    <div className="font-bold text-ink text-sm">{r.customer_name}</div>
                    <div className="text-xs text-mid mt-0.5">{r.location_context}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-ink text-white">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ready to make yours?
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Five templates, endless locations. Start customizing in under a minute.
          </p>
          <Link
            href="/prints/golf"
            className="inline-flex items-center gap-2 bg-white text-ink px-8 py-4 rounded-full font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] transition-all"
          >
            Shop Prints <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

function WallFrame({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${compact ? '' : 'shadow-[0_20px_60px_rgba(26,26,46,0.15)]'}`}>
      <div
        className="relative w-full"
        style={{
          background: 'linear-gradient(180deg, #f0e8db 0%, #e8ddc7 60%, #dfd2b8 100%)',
          padding: compact ? '8%' : '10%',
        }}
      >
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
