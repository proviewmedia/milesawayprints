import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopClient from './ShopClient';
import { supabase } from '@/lib/supabase';
import { DEFAULT_GALLERY, PrintType } from '@/data/prints';
import { DesignSummary, Collection, toDesignSummary, GalleryItemWithMeta } from '@/data/shop';

export const metadata: Metadata = {
  title: 'Shop All Prints',
  description:
    'Browse every design in the Miles Away Prints collection. Golf courses, stadiums, airports, marathons, and cities — ready to ship.',
};

async function getAllDesigns(): Promise<DesignSummary[]> {
  const { data } = await supabase
    .from('gallery_items')
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (!data || data.length === 0) {
    // Fallback to seed data (with synthetic slugs) if the table has no rows yet
    const all: DesignSummary[] = [];
    (Object.keys(DEFAULT_GALLERY) as PrintType[]).forEach((type) => {
      DEFAULT_GALLERY[type].forEach((item) => {
        all.push({
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          name: item.name,
          location: item.location,
          type,
          values: item.values,
        });
      });
    });
    return all;
  }

  return data.map((row: GalleryItemWithMeta) =>
    toDesignSummary(row, row.print_type_slug as PrintType),
  );
}

async function getCollections(): Promise<Collection[]> {
  const { data: cols } = await supabase
    .from('collections')
    .select('id, slug, name, description, hero_image_url, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (!cols || cols.length === 0) return [];

  const { data: items } = await supabase
    .from('collection_items')
    .select(`collection_id, sort_order, gallery_item:gallery_items (id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url)`)
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
      <Navbar />
      <ShopClient designs={designs} collections={collections} />
      <Footer />
    </>
  );
}
