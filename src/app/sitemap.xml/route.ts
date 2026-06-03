import { createAdminClient } from '@/lib/supabase';

const BASE = 'https://www.milesawayprints.com';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UrlEntry {
  loc: string;
  lastmod?: Date;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
  /** Absolute image URLs — emitted as <image:image><image:loc>…. */
  images?: string[];
}

/**
 * Hand-built sitemap so we can emit the `image:image` namespace that
 * Next.js 14's MetadataRoute.Sitemap helper doesn't support (added in
 * 15.x). Google Images crawls these entries to surface products under
 * image-search queries like "chicago skyline print".
 */
export async function GET() {
  const now = new Date();
  const admin = createAdminClient();

  const staticUrls: UrlEntry[] = [
    { loc: `${BASE}/`, lastmod: now, changefreq: 'weekly', priority: 1.0 },
    { loc: `${BASE}/shop`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${BASE}/gifts`, lastmod: now, changefreq: 'weekly', priority: 0.9 },
    { loc: `${BASE}/gifts/fathers-day`, lastmod: now, changefreq: 'weekly', priority: 0.9 },
    { loc: `${BASE}/gifts/birthday`, lastmod: now, changefreq: 'weekly', priority: 0.85 },
    { loc: `${BASE}/gifts/anniversary`, lastmod: now, changefreq: 'weekly', priority: 0.85 },
    { loc: `${BASE}/gifts/holiday`, lastmod: now, changefreq: 'weekly', priority: 0.85 },
    { loc: `${BASE}/about`, lastmod: now, changefreq: 'monthly', priority: 0.6 },
    { loc: `${BASE}/faq`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/shipping`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/returns`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/contact`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/privacy`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
    { loc: `${BASE}/terms`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
    { loc: `${BASE}/sign-in`, lastmod: now, changefreq: 'yearly', priority: 0.2 },
  ];

  const types = ['golf', 'stadium', 'airport', 'marathon', 'city', 'skyline', 'f1'];
  const categoryUrls: UrlEntry[] = types.map((t) => ({
    loc: `${BASE}/prints/${t}`,
    lastmod: now,
    changefreq: 'weekly',
    priority: 0.85,
  }));

  const [productsRes, marathonsRes] = await Promise.all([
    admin
      .from('gallery_items')
      .select('slug, image_url, created_at')
      .eq('active', true),
    admin
      .from('marathons')
      .select('slug, thumbnail_path, created_at')
      .eq('active', true),
  ]);

  const productUrls: UrlEntry[] = (productsRes.data ?? []).map((p) => ({
    loc: `${BASE}/shop/${p.slug}`,
    lastmod: p.created_at ? new Date(p.created_at) : now,
    changefreq: 'weekly',
    priority: 0.8,
    images: p.image_url ? [p.image_url] : undefined,
  }));

  const marathonUrls: UrlEntry[] = (marathonsRes.data ?? []).map((m) => ({
    loc: `${BASE}/marathons/${m.slug}`,
    lastmod: m.created_at ? new Date(m.created_at) : now,
    changefreq: 'weekly',
    priority: 0.85,
    images: m.thumbnail_path ? [`${BASE}${m.thumbnail_path}`] : undefined,
  }));

  const all = [...staticUrls, ...categoryUrls, ...productUrls, ...marathonUrls];
  const xml = buildXml(all);

  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, must-revalidate',
    },
  });
}

function buildXml(entries: UrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const parts: string[] = [`    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod.toISOString()}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (typeof e.priority === 'number')
        parts.push(`    <priority>${e.priority.toFixed(2)}</priority>`);
      if (e.images?.length) {
        for (const img of e.images) {
          parts.push(
            `    <image:image><image:loc>${escapeXml(img)}</image:loc></image:image>`,
          );
        }
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
