import { ImageResponse } from 'next/og';

export const runtime = 'edge';
// 96×96 — a multiple of 48 so Google Search reliably uses this clean favicon
// (rather than falling back to the apple-touch-icon) in search results.
export const size = { width: 96, height: 96 };
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        MAP
      </div>
    ),
    size,
  );
}
