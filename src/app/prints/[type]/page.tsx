import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrintCustomizer from './PrintCustomizer';
import { PRINT_CONFIGS, PrintType, DEFAULT_GALLERY, GalleryItem } from '@/data/prints';
import { supabase } from '@/lib/supabase';

const VALID_TYPES: PrintType[] = ['golf', 'stadium', 'airport', 'marathon', 'city'];

function isValidType(t: string): t is PrintType {
  return VALID_TYPES.includes(t as PrintType);
}

export async function generateMetadata({
  params,
}: {
  params: { type: string };
}): Promise<Metadata> {
  if (!isValidType(params.type)) return {};
  const cfg = PRINT_CONFIGS[params.type];
  return {
    title: cfg.seoTitle,
    description: cfg.seoDescription,
  };
}

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

async function getGallery(type: PrintType): Promise<GalleryItem[]> {
  const { data } = await supabase
    .from('gallery_items')
    .select('id, name, location, image_url, values')
    .eq('print_type_slug', type)
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (!data || data.length === 0) return DEFAULT_GALLERY[type];
  return data as GalleryItem[];
}

export default async function PrintPage({ params }: { params: { type: string } }) {
  if (!isValidType(params.type)) notFound();
  const type = params.type;
  const config = PRINT_CONFIGS[type];
  const gallery = await getGallery(type);

  return (
    <>
      <Navbar />
      <PrintCustomizer config={config} gallery={gallery} />
      <Footer />
    </>
  );
}
