import { createAdminClient } from '@/lib/supabase';
import { PRINT_CONFIGS, type PrintType } from '@/data/prints';
import {
  type GalleryItemWithMeta,
  toDesignSummary,
  type DesignSummary,
  DEFAULT_DIGITAL_PRICE_CENTS,
} from '@/data/shop';
import { SITE_URL as SITE, SITE_NAME as SHOP_NAME } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Google Merchant Center product feed.
 *
 * Spec: https://support.google.com/merchants/answer/7052112
 *
 * Each variant (per-size) gets its own `<item>` with a stable `g:id`.
 * `g:item_group_id` links variants of the same design together.
 *
 * After deploying:
 *   1. Sign in at https://merchants.google.com
 *   2. Verify the website (reuses the Google Search Console verification
 *      meta tag in src/app/layout.tsx — already in place)
 *   3. Add a "Scheduled fetch" product source pointing to
 *      https://www.milesawayprints.com/products.xml
 *   4. Set country to US, language to en
 *   5. First review approval typically takes 3 business days
 */
export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('gallery_items')
    .select(
      'id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents',
    )
    .eq('active', true)
    .order('sort_order', { ascending: true });

  const designs: DesignSummary[] = ((data ?? []) as GalleryItemWithMeta[]).map(
    (r) => toDesignSummary(r, r.print_type_slug as PrintType),
  );

  const itemsXml = designs.flatMap((d) => emitItemsForDesign(d)).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SHOP_NAME)}</title>
    <link>${SITE}</link>
    <description>Custom location art prints — skylines, airports, golf, marathons, stadiums, F1, cities.</description>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, must-revalidate',
    },
  });
}

function emitItemsForDesign(d: DesignSummary): string[] {
  const typeLabel = PRINT_CONFIGS[d.type]?.detailsLabel ?? 'Art Print';
  const description =
    d.description ??
    `${d.name} — ${typeLabel.toLowerCase()} from Miles Away Prints. Made-to-order, archival fine-art paper, shipped worldwide.`;
  const productType = `Home & Garden > Decor > Artwork > ${typeLabel}`;

  const items: string[] = [];
  const physicalPrices = (d.printful_prices ?? {}) as Record<string, number>;

  // Physical variants — one item per size.
  for (const [size, cents] of Object.entries(physicalPrices)) {
    items.push(
      xmlItem({
        id: `${d.slug}-${size}`,
        groupId: d.slug,
        title: `${d.name} ${typeLabel} Print — ${size}`,
        description,
        // Clean canonical link (no ?size=) so the feed matches the product
        // page's canonical tag — avoids Merchant Center canonical-mismatch
        // warnings. Variants are differentiated by g:id + g:item_group_id.
        link: `${SITE}/shop/${d.slug}`,
        imageLink: d.image_url ?? `${SITE}/api/og/product/${d.slug}`,
        priceUsd: cents / 100,
        productType,
        size,
      }),
    );
  }

  // Digital variant — only if no physical variants exist (avoid Merchant
  // Center duplicates for the same artwork).
  if (Object.keys(physicalPrices).length === 0) {
    const digitalCents = d.digital_price_cents ?? DEFAULT_DIGITAL_PRICE_CENTS;
    items.push(
      xmlItem({
        id: `${d.slug}-digital`,
        groupId: d.slug,
        title: `${d.name} ${typeLabel} Print — Digital`,
        description,
        link: `${SITE}/shop/${d.slug}`,
        imageLink: d.image_url ?? `${SITE}/api/og/product/${d.slug}`,
        priceUsd: digitalCents / 100,
        productType,
        size: 'Digital',
      }),
    );
  }

  return items;
}

interface XmlItemArgs {
  id: string;
  groupId: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  priceUsd: number;
  productType: string;
  size: string;
}

function xmlItem(a: XmlItemArgs): string {
  return `    <item>
      <g:id>${escapeXml(a.id)}</g:id>
      <g:item_group_id>${escapeXml(a.groupId)}</g:item_group_id>
      <g:title>${escapeXml(a.title)}</g:title>
      <g:description>${escapeXml(a.description)}</g:description>
      <g:link>${escapeXml(a.link)}</g:link>
      <g:image_link>${escapeXml(a.imageLink)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${a.priceUsd.toFixed(2)} USD</g:price>
      <g:brand>${escapeXml(SHOP_NAME)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>false</g:identifier_exists>
      <g:product_type>${escapeXml(a.productType)}</g:product_type>
      <g:google_product_category>500045</g:google_product_category>
      <g:size>${escapeXml(a.size)}</g:size>
      <g:product_highlight>Made to order — printed in 3–5 business days</g:product_highlight>
      <g:product_highlight>Archival fine-art giclée paper</g:product_highlight>
      <g:product_highlight>Personalized with your name, location, and details</g:product_highlight>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>7.00 USD</g:price>
      </g:shipping>
    </item>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
