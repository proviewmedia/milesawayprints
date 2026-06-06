import type { DesignSummary } from '@/data/shop';
import type { PrintType } from '@/data/prints';

/**
 * Per-product copy. Every product URL needs content that is specific to the
 * permutation — Google's 2026 updates ignore pages whose only differentiator
 * is a keyword. A manual gallery_items.description always wins; otherwise we
 * compose a sentence from the product's real stats (par, IATA code, capacity,
 * coordinates…) so each page says something true and unique about THAT place.
 */

// The searched keyword phrase for titles/H1 (not the on-page config H1).
const TYPE_PRINT_LABEL: Record<PrintType, string> = {
  golf: 'Golf Course Print',
  stadium: 'Stadium Print',
  airport: 'Airport Map Print',
  marathon: 'Marathon Print',
  city: 'City Map Print',
  skyline: 'Skyline Print',
  f1: 'F1 Circuit Print',
};

const TYPE_NOUN: Record<PrintType, string> = {
  golf: 'golf course print',
  stadium: 'stadium print',
  airport: 'airport map print',
  marathon: 'marathon print',
  city: 'city street-map print',
  skyline: 'city skyline print',
  f1: 'F1 circuit print',
};

/**
 * SEO title / H1 in the "{place} {keyword}" pattern people search, with a
 * dedupe so we never produce "Chicago Skyline Skyline Print" or
 * "Miami Street Map City Map Print".
 */
export function productTitle(design: DesignSummary): string {
  const name = design.name.trim();
  const nameLc = name.toLowerCase();
  if (nameLc.endsWith('print')) return name;
  const label = TYPE_PRINT_LABEL[design.type] ?? 'Art Print';
  const labelWords = label.toLowerCase().replace(/ print$/, '').split(' ');
  if (labelWords.some((w) => nameLc.includes(w))) return `${name} Print`;
  return `${name} ${label}`;
}

function val(values: Record<string, string> | undefined, key: string): string | null {
  const v = (values?.[key] ?? '').toString().trim();
  if (!v || v === '—' || v === '-' || v === '–' || v.toLowerCase() === 'n/a') return null;
  return v;
}

function join(parts: (string | null)[]): string {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * A unique, data-specific paragraph for the product page (rendered visibly,
 * not just in meta). Prefers a hand-written description; falls back to a
 * stat-driven sentence; never returns the generic boilerplate fallback.
 */
export function productDescription(design: DesignSummary): string {
  if (design.description?.trim()) return design.description.trim();

  const v = design.values ?? {};
  // Synced products store an em-dash placeholder when there's no location;
  // treat those (and empty) as "no location" so we never render "print of —".
  const loc = (design.location ?? '').trim();
  const hasLoc = loc.length > 0 && !['—', '–', '-', 'n/a'].includes(loc.toLowerCase());
  const where = hasLoc ? ` of ${loc}` : '';
  const name = design.name.trim();

  switch (design.type) {
    case 'golf': {
      const stats = join([
        val(v, 'stat1') ? `plays ${val(v, 'stat1')}` : null,
        val(v, 'stat2') ? `to a par of ${val(v, 'stat2')}` : null,
        val(v, 'stat3') ? `with a ${val(v, 'stat3')} course rating` : null,
      ]);
      return join([
        `${name} — a custom golf course print${where}, drawn from real course-routing data with every fairway, green, and bunker faithful to the layout.`,
        stats ? `It ${stats}.` : null,
      ]);
    }
    case 'airport': {
      const code = val(v, 'stat1');
      const stats = join([
        val(v, 'stat2') ? `${val(v, 'stat2')} runways` : null,
        val(v, 'stat3') ? `at ${val(v, 'stat3')} elevation` : null,
      ]);
      return join([
        `${name}${code ? ` (${code})` : ''} — a custom airport map print${where}, every runway, taxiway, and terminal rendered from real aviation data.`,
        stats ? `${stats[0].toUpperCase()}${stats.slice(1)}.` : null,
      ]);
    }
    case 'stadium': {
      const stats = join([
        val(v, 'stat1') ? `seats ${val(v, 'stat1')}` : null,
        val(v, 'stat2') ? `and opened in ${val(v, 'stat2')}` : null,
      ]);
      return join([
        `${name} — a custom stadium print${where}, drawn from above in minimalist line work.`,
        stats ? `It ${stats}.` : null,
      ]);
    }
    case 'skyline': {
      const stats = join([
        val(v, 'stat1') ? `home to ${val(v, 'stat1')}` : null,
        val(v, 'stat2') ? `and founded ${val(v, 'stat2')}` : null,
      ]);
      return join([
        `${name} — a custom city skyline print, the city's landmarks rendered as a clean silhouette against an open sky.`,
        stats ? `${name} is ${stats}.` : null,
      ]);
    }
    case 'city': {
      const coords = join([
        val(v, 'stat1') ? `${val(v, 'stat1')}` : null,
        val(v, 'stat2') ? `${val(v, 'stat2')}` : null,
      ]);
      return join([
        `${name} — a custom street-map print${where}, the road network rendered in clean minimalist linework.`,
        val(v, 'stat3') ? `Founded ${val(v, 'stat3')}.` : null,
        coords ? `Centered near ${coords}.` : null,
      ]);
    }
    case 'f1': {
      const stats = join([
        val(v, 'stat1') ? `${val(v, 'stat1')} per lap` : null,
        val(v, 'stat2') ? `over ${val(v, 'stat2')} laps` : null,
      ]);
      return join([
        `${name} — a custom F1 circuit print${where}, every corner and chicane drawn to scale.`,
        stats ? `It runs ${stats}.` : null,
        val(v, 'stat3') ? `First raced in ${val(v, 'stat3')}.` : null,
      ]);
    }
    case 'marathon':
    default:
      return `${name} — a custom ${TYPE_NOUN[design.type] ?? 'art print'}${where}, hand-built from the real route and personalized with your name, time, and date.`;
  }
}

/**
 * A product-specific FAQ prepended to the shared per-type FAQs so each
 * product's FAQPage block (rendered + JSON-LD) isn't byte-identical to every
 * other product of the same type.
 */
export function productIntroFaq(design: DesignSummary): { q: string; a: string } {
  const noun = TYPE_NOUN[design.type] ?? 'print';
  return {
    q: `Can I personalize the ${design.name} print?`,
    a: `Yes — the ${design.name} ${noun} is made to order. Add your title, names, dates, and details and we render it live before checkout, then print it on archival fine-art paper in your choice of six sizes.`,
  };
}
