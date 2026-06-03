import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-static';
export const revalidate = 86400; // 1 day

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f3ef',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#6b6b6b',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          Miles Away · Prints
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 84,
              color: '#0e0e0e',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            Custom location
            <br />
            art prints.
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#6b6b6b',
              lineHeight: 1.3,
              maxWidth: 880,
            }}
          >
            Skylines, airports, marathons, golf courses, stadiums, F1 circuits, and cities — personalized and shipped worldwide.
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 'auto',
          }}
        >
          {['Skylines', 'Airports', 'Marathons', 'Golf', 'Stadiums', 'F1', 'Cities'].map((label) => (
            <div
              key={label}
              style={{
                fontSize: 18,
                color: '#0e0e0e',
                border: '1px solid #e8e6e0',
                padding: '8px 16px',
                borderRadius: 999,
                backgroundColor: '#ffffff',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
