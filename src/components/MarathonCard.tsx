import Link from 'next/link';

interface Props {
  slug: string;
  city: string;
  thumbnailPath: string | null;
  fromCents?: number;
}

/**
 * Marathon poster card.
 *
 * Renders a flat PNG/JPG preview supplied by the designer. We deliberately
 * don't inline or embed the source SVG here — the SVG is for the live
 * customizer page where text needs to mutate. For a small card slot, the
 * baked image avoids font fallbacks, clipPath collisions, and external-
 * resource sandboxing that bite when SVGs are scattered across a page.
 */
export default function MarathonCard({ slug, city, thumbnailPath, fromCents }: Props) {
  const fromDollars = fromCents != null ? (fromCents / 100).toFixed(0) : null;

  return (
    <Link href={`/marathons/${slug}`} className="group block">
      {thumbnailPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailPath}
          alt={`${city} Marathon poster`}
          className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="aspect-[3/4] flex items-center justify-center text-xs text-mid bg-soft">
          Preview unavailable
        </div>
      )}
      <div className="mt-4">
        <div className="text-[15px] text-ink truncate">{city} Marathon</div>
        {fromDollars && (
          <div className="text-[13px] text-ink mt-1.5">
            <span className="text-mid">From</span> ${fromDollars}
          </div>
        )}
      </div>
    </Link>
  );
}
