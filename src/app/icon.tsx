import { ImageResponse } from 'next/og';
import { loadArchivoBlack } from '@/lib/og/archivo';

export const runtime = 'edge';
// 96×96 — a multiple of 48 so Google Search reliably uses this clean favicon
// (rather than falling back to the apple-touch-icon) in search results.
export const size = { width: 96, height: 96 };
export const contentType = 'image/png';

export default async function Icon() {
  const font = await loadArchivoBlack('INQ');
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e0e0e',
          color: '#ffffff',
          fontSize: 42,
          letterSpacing: '-0.04em',
          fontFamily: 'Archivo',
        }}
      >
        INQ
      </div>
    ),
    { ...size, fonts: [{ name: 'Archivo', data: font, weight: 900, style: 'normal' }] },
  );
}
