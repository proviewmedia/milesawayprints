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
 * Uses a fixed 4:5 aspect container so it sizes the same as the
 * gallery_items DesignCards. The thumbnail (which is itself a 3:4
 * portrait poster) sits inside on a white background with a small inset,
 * giving it a matted-frame look that matches the other cards visually.
 */
export default function MarathonCard({ slug, city, thumbnailPath, fromCents }: Props) {
  const fromDollars = fromCents != null ? (fromCents / 100).toFixed(0) : null;

  return (
    <Link href={`/marathons/${slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-white flex items-center justify-center p-[6%]">
        {thumbnailPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailPath}
            alt={`${city} Marathon poster`}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
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
