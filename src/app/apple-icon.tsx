import { ImageResponse } from 'next/og';
import { loadArchivoBlack } from '@/lib/og/archivo';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const font = await loadArchivoBlack('INQ');
  // Clean "INQ" mark — identical to the favicon (icon.tsx), just scaled up.
  // No subtitle: Google Search and iOS both use this, and it should match
  // the browser-tab icon exactly.
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
          fontFamily: 'Archivo',
          fontSize: 80,
          letterSpacing: '-0.04em',
        }}
      >
        INQ
      </div>
    ),
    { ...size, fonts: [{ name: 'Archivo', data: font, weight: 900, style: 'normal' }] },
  );
}
