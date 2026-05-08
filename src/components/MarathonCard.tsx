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
 * Renders the supplied PNG poster as a matted, drop-shadowed frame so the
 * full image is visible without crop. Tile uses the same aspect-[4/5]
 * outer size as DesignCard so heights line up across the row.
 */
export default function MarathonCard({ slug, city, thumbnailPath, fromCents }: Props) {
  const fromDollars = fromCents != null ? (fromCents / 100).toFixed(0) : null;

  return (
    <Link href={`/marathons/${slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-white flex items-center justify-center">
        {thumbnailPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailPath}
            alt={`${city} Marathon poster`}
            className="w-[85%] h-auto object-contain drop-shadow-[0_10px_18px_rgba(26,26,46,0.20)] transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="text-xs text-mid">Preview unavailable</span>
        )}
      </div>
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
