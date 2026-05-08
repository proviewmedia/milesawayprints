import Link from 'next/link';

interface Props {
  slug: string;
  city: string;
  svgPath: string;
  fromCents?: number;
}

/**
 * Marathon poster card.
 *
 * Renders the source SVG via `<object>` so it loads as its own document.
 * That gives us:
 *   - Internal `<clipPath>` references work — multiple cards on a page can
 *     each have their own `id="clippath"` without colliding (which is what
 *     happened with `dangerouslySetInnerHTML`: the second SVG's clip URL
 *     resolved to the first SVG's clipPath, leaking the embedded street
 *     image outside the blue panel).
 *   - External image refs (`xlink:href="/marathons/foo.png"`) load.
 * `pointer-events-none` so clicks fall through to the Link wrapper.
 */
export default function MarathonCard({ slug, city, svgPath, fromCents }: Props) {
  const fromDollars = fromCents != null ? (fromCents / 100).toFixed(0) : null;

  return (
    <Link href={`/marathons/${slug}`} className="group block">
      <div className="bg-white">
        {svgPath ? (
          <object
            data={svgPath}
            type="image/svg+xml"
            aria-label={`${city} Marathon poster`}
            className="block w-full h-auto pointer-events-none transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="aspect-[3/4] flex items-center justify-center text-xs text-mid bg-soft">
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
