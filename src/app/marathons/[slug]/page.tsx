import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { loadSvgFromPublic } from '@/lib/marathon-svg';
import type { MarathonRow } from '@/data/marathons';
import MarathonCustomizer from './MarathonCustomizer';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data } = await supabase
    .from('marathons')
    .select('city')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();
  if (!data) return { title: 'Marathon — Miles Away Prints' };
  return {
    title: `${data.city} Marathon Print | Miles Away Prints`,
    description: `Custom ${data.city} Marathon and Half Marathon prints — personalized with your name, bib, finish time, and race date.`,
  };
}

export default async function MarathonPage({ params }: Props) {
  const { slug } = await params;

  const { data: row } = await supabase
    .from('marathons')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (!row) return notFound();

  const marathon = row as MarathonRow;

  const [fullSvg, halfSvg] = await Promise.all([
    marathon.full_svg_path ? safeLoad(marathon.full_svg_path) : Promise.resolve(null),
    marathon.half_svg_path ? safeLoad(marathon.half_svg_path) : Promise.resolve(null),
  ]);

  return (
    <main className="bg-paper min-h-screen">
      {/* The marathon SVG templates were drawn in Josefin Sans. Load it on
          this route so the inlined SVG matches the source. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;700&display=swap"
      />
      <NavbarShell />
      <MarathonCustomizer marathon={marathon} fullSvg={fullSvg} halfSvg={halfSvg} />
      <Footer />
    </main>
  );
}

async function safeLoad(path: string): Promise<string | null> {
  try {
    return await loadSvgFromPublic(path);
  } catch {
    return null;
  }
}
