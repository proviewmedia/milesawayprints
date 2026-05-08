import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { loadSvgFromPublic } from '@/lib/marathon-svg';
import type { MarathonRow } from '@/data/marathons';
import MarathonCustomizer from './MarathonCustomizer';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

// Use the admin client — this is a server-only page and we want a direct
// read regardless of any RLS policy state on the marathons table.
export async function generateMetadata({ params }: Props) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('marathons')
    .select('city')
    .eq('slug', params.slug)
    .eq('active', true)
    .maybeSingle();
  if (!data) return { title: 'Marathon — Miles Away Prints' };
  return {
    title: `${data.city} Marathon Print | Miles Away Prints`,
    description: `Custom ${data.city} Marathon and Half Marathon prints — personalized with your name, bib, finish time, and race date.`,
  };
}

export default async function MarathonPage({ params }: Props) {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from('marathons')
    .select('*')
    .eq('slug', params.slug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('[marathon page] supabase error', error);
  }
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
