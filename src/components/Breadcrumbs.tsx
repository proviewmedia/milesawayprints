import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/seo';

export interface Crumb {
  name: string;
  /** On the last crumb this is only used for JSON-LD; it renders as text. */
  href?: string;
}

interface Props {
  /** Trail after Home. The last item is the current page. */
  items: Crumb[];
  /** 'dark' for the black page heroes, 'light' on paper. */
  tone?: 'dark' | 'light';
  /** Emit BreadcrumbList JSON-LD. Off where the page already emits its own. */
  jsonLd?: boolean;
  className?: string;
}

/**
 * "You are here" trail shown at the top of every inner page, in place of the
 * hero eyebrow. Home is added automatically.
 */
export default function Breadcrumbs({ items, tone = 'dark', jsonLd = true, className = 'mb-6' }: Props) {
  const trail: Crumb[] = [{ name: 'Home', href: '/' }, ...items];
  const muted = tone === 'dark' ? 'text-paper/60' : 'text-mid';
  const strong = tone === 'dark' ? 'text-paper' : 'text-ink';
  const hover = tone === 'dark' ? 'hover:text-paper' : 'hover:text-ink';

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              breadcrumbJsonLd(
                trail.filter((c) => c.href).map((c) => ({ name: c.name, url: c.href as string })),
              ),
            ),
          }}
        />
      )}
      <ol className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] ${muted}`}>
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
              {last || !c.href ? (
                <span className={last ? `${strong} font-medium` : ''} aria-current={last ? 'page' : undefined}>
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className={`${hover} underline-offset-2 hover:underline`}>
                  {c.name}
                </Link>
              )}
              {!last && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
