import Link from 'next/link';

export default function PolicyCTA() {
  return (
    <section className="py-24 md:py-32 bg-ink text-paper">
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight leading-[1.05] mb-5">
          Make your place.
        </h2>
        <p className="text-paper/70 mb-9 max-w-md mx-auto">
          Browse the collection or start a custom print of any place in the world.
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
  );
}
