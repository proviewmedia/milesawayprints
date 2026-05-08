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
      <div className="relative aspect-[4/5] flex items-center justify-center px-2">
        {thumbnailPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailPath}
            alt={`${city} Marathon poster`}
            className="block w-full max-h-full object-contain bg-white p-[6%] shadow-[0_24px_40px_-12px_rgba(26,26,46,0.30),0_8px_16px_-8px_rgba(26,26,46,0.18)] transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="aspect-[4/5] w-full flex items-center justify-center text-xs text-mid bg-soft">
            Preview unavailable
          </div>
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
