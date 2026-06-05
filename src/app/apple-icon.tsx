import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  // Clean "MAP" mark — identical to the favicon (icon.tsx), just scaled up.
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
          color: '#f5f3ef',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        MAP
      </div>
    ),
    size,
  );
}
