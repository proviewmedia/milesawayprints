import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { MarathonCustomization, MarathonVariant } from '@/data/marathons';
import { formatRaceDate, SVG_PLACEHOLDERS } from '@/data/marathons';

// Re-export for callers that already import from this module.
export { SVG_PLACEHOLDERS };

export function loadSvgFromPublic(publicPath: string): Promise<string> {
  // publicPath is "/marathons/las-vegas-full.svg" → resolve under public/
  const safe = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath;
  return readFile(join(process.cwd(), 'public', safe), 'utf8');
}

/** Pure-string substitution. Used by the server-side render path. The same
 *  rules run client-side via DOM mutation in the customizer. */
export function applyMarathonValues(
  svg: string,
  c: MarathonCustomization,
): string {
  const fullName = `${c.first_name || 'John'} ${c.last_name || 'Doe'}`.trim() || 'John Doe';
  const bibText = c.bib ? `#${c.bib.replace(/^#/, '')}` : SVG_PLACEHOLDERS.bib;
  const finish = c.finish_time || SVG_PLACEHOLDERS.finishTime;
  const date = c.race_date ? formatRaceDate(c.race_date) : SVG_PLACEHOLDERS.date;

  return svg
    .replace(`>${SVG_PLACEHOLDERS.bib}<`, `>${bibText}<`)
    .replace(`>${SVG_PLACEHOLDERS.name}<`, `>${escapeXml(fullName)}<`)
    .replace(`>${SVG_PLACEHOLDERS.finishTime}<`, `>${escapeXml(finish)}<`)
    .replace(`>${SVG_PLACEHOLDERS.date}<`, `>${escapeXml(date)}<`);
}

export function svgPathForVariant(
  row: { full_svg_path: string | null; half_svg_path: string | null },
  variant: MarathonVariant,
): string | null {
  return variant === 'half' ? row.half_svg_path : row.full_svg_path;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
