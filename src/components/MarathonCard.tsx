import Link from 'next/link';

interface Props {
  slug: string;
  city: string;
  svgPath: string;
  fromCents?: number;
}

/**
 * Marathon poster card — used on the /marathons index and the homepage row.
 * Renders the actual poster SVG via an <img> so the browser can resolve the
 * embedded route PNG without needing the SVG inline. Click → /marathons/<slug>.
 */
export default function MarathonCard({ slug, city, svgPath, fromCents }: Props) {
  const fromDollars = fromCents != null ? (fromCents / 100).toFixed(0) : null;
  return (
    <Link href={`/marathons/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgPath}
          alt={`${city} Marathon print`}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-4">
        <div className="text-[15px] text-ink truncate">{city} Marathon</div>
        <div className="text-[13px] text-mid mt-0.5 truncate">Personalized print</div>
        {fromDollars && (
          <div className="text-[13px] text-ink mt-1.5">
            <span className="text-mid">From</span> ${fromDollars}
          </div>
        )}
      </div>
    </Link>
  );
}
