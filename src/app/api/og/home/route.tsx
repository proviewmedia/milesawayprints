import { ImageResponse } from 'next/og';
import { loadArchivoBlack } from '@/lib/og/archivo';

export const runtime = 'edge';
export const dynamic = 'force-static';
export const revalidate = 86400; // 1 day

// Share card for the homepage: mirrors the site hero (full-bleed black, the
// INQ PRESS logo, heavy uppercase headline). Satori requires every <div> with
// more than one child to declare display: flex, so each multi-line block does.
export async function GET() {
  const headline = ['Your idea.', 'Printed on', 'anything.'];
  const font = await loadArchivoBlack(headline.join('').toUpperCase());
  const logo = await fetch(new URL('../../../../../public/inq-logo-white.png', import.meta.url)).then(
    (r) => r.arrayBuffer(),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0e0e0e',
          color: '#ffffff',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Satori accepts raw image bytes as src */}
        {/* eslint-disable-next-line @next/next/no-img-element, @typescript-eslint/no-explicit-any */}
        <img src={logo as any} width={285} height={91} alt="" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            fontFamily: 'Archivo',
            fontSize: 96,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          {headline.map((line) => (
            <div key={line} style={{ display: 'flex' }}>
              {line}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 26,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Shirts, hats, stickers, signs, posters, and merch, with free quotes
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Archivo', data: font, weight: 900, style: 'normal' }],
    },
  );
}
