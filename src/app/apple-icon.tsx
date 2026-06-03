import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e0e0e',
          color: '#f5f3ef',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          MAP
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#9c9c9c',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: 12,
          }}
        >
          Miles Away Prints
        </div>
      </div>
    ),
    size,
  );
}
