import Link from 'next/link';
import { loadSvgFromPublic } from '@/lib/marathon-svg';

interface Props {
  slug: string;
  city: string;
  svgPath: string;
  fromCents?: number;
}

/**
 * Marathon poster card — used on the homepage marathon row.
 *
 * Renders the actual poster SVG inline (read server-side from /public) so
 * the embedded `<image href="...">` route PNG loads correctly. Loading the
 * SVG via `<img src="...">` doesn't work — browsers block external image
 * refs inside SVGs that come in through `<img>`, leaving the route map
 * blank.
 */
export default async function MarathonCard({ slug, city, svgPath, fromCents }: Props) {
  const fromDollars = fromCents != null ? (fromCents / 100).toFixed(0) : null;
  const svgInline = await safeLoad(svgPath);

  return (
    <Link href={`/marathons/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        {svgInline ? (
          <div
            className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02] [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: svgInline }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-mid">
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

async function safeLoad(svgPath: string): Promise<string | null> {
  if (!svgPath) return null;
  try {
    return await loadSvgFromPublic(svgPath);
  } catch {
    return null;
  }
}
