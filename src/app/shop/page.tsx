import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import ShopClient from './ShopClient';
import { createAdminClient } from '@/lib/supabase';
import { PrintType } from '@/data/prints';
import { DesignSummary, Collection, toDesignSummary, GalleryItemWithMeta } from '@/data/shop';

export const metadata: Metadata = {
  title: 'Shop All Prints',
  description:
    'Browse every design in the Miles Away Prints collection. Skylines, F1 circuits, golf courses, stadiums, airports, marathons, and cities — ready to ship.',
};

export const dynamic = 'force-dynamic';

// Use the admin (service-role) client server-side. The anon client was
// silently truncating responses in production for reasons we couldn't
// reproduce locally; admin client sidesteps any RLS / proxy oddities.
async function getAllDesigns(): Promise<DesignSummary[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('gallery_items')
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, sort_order, printful_product_id, printful_variants, printful_prices, digital_price_cents')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .limit(500);

  if (!data) return [];
  return data.map((row: GalleryItemWithMeta) =>
    toDesignSummary(row, row.print_type_slug as PrintType),
  );
}

async function getCollections(): Promise<Collection[]> {
  const admin = createAdminClient();
  const { data: cols } = await admin
    .from('collections')
    .select('id, slug, name, description, hero_image_url, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (!cols || cols.length === 0) return [];

  const { data: items } = await admin
    .from('collection_items')
    .select(`collection_id, sort_order, gallery_item:gallery_items (id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents)`)
    .order('sort_order', { ascending: true });

  type JoinedItem = { collection_id: string; sort_order: number; gallery_item: GalleryItemWithMeta | GalleryItemWithMeta[] };
  const joined = (items ?? []) as unknown as JoinedItem[];

  return cols.map((c) => {
    const designs: DesignSummary[] = joined
      .filter((it) => it.collection_id === c.id)
      .map((it) => {
        const g = Array.isArray(it.gallery_item) ? it.gallery_item[0] : it.gallery_item;
        return toDesignSummary(g, g.print_type_slug as PrintType);
      })
      .filter((d): d is DesignSummary => Boolean(d));
    return { ...c, designs };
  });
}

export default async function ShopPage() {
  const [designs, collections] = await Promise.all([getAllDesigns(), getCollections()]);

  return (
    <>
      <NavbarShell />
      <ShopClient designs={designs} collections={collections} />
      <Footer />
    </>
  );
}
