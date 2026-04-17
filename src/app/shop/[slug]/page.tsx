import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DesignDetail from './DesignDetail';
import { supabase } from '@/lib/supabase';
import { DEFAULT_GALLERY, PrintType } from '@/data/prints';
import { DesignSummary, toDesignSummary, GalleryItemWithMeta } from '@/data/shop';

async function getDesign(slug: string): Promise<{
  design: DesignSummary;
  related: DesignSummary[];
} | null> {
  const { data } = await supabase
    .from('gallery_items')
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (data) {
    const design = toDesignSummary(data as GalleryItemWithMeta, data.print_type_slug as PrintType);

    const { data: rel } = await supabase
      .from('gallery_items')
      .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url')
      .eq('print_type_slug', data.print_type_slug)
      .eq('active', true)
      .neq('slug', slug)
      .limit(4);

    return {
      design,
      related: (rel ?? []).map((r: GalleryItemWithMeta) =>
        toDesignSummary(r, r.print_type_slug as PrintType),
      ),
    };
  }

  // Fallback to seed data
  for (const type of Object.keys(DEFAULT_GALLERY) as PrintType[]) {
    const match = DEFAULT_GALLERY[type].find(
      (it) => it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === slug,
    );
    if (match) {
      const design: DesignSummary = {
        slug,
        name: match.name,
        location: match.location,
        type,
        values: match.values,
      };
      const related: DesignSummary[] = DEFAULT_GALLERY[type]
        .filter((it) => it.name !== match.name)
        .map((it) => ({
          slug: it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          name: it.name,
          location: it.location,
          type,
          values: it.values,
        }));
      return { design, related };
    }
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getDesign(params.slug);
  if (!result) return {};
  const { design } = result;
  return {
    title: `${design.name} Art Print`,
    description: design.description ?? `Custom art print of ${design.name} — ${design.location}. Digital download or museum-quality print.`,
  };
}

export default async function DesignPage({ params }: { params: { slug: string } }) {
  const result = await getDesign(params.slug);
  if (!result) notFound();
  const { design, related } = result;

  return (
    <>
      <Navbar />
      <DesignDetail design={design} related={related} />
      <Footer />
    </>
  );
}
