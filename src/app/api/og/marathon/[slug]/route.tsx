import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('marathons')
    .select('city, thumbnail_path, printful_prices')
    .eq('slug', params.slug)
    .eq('active', true)
    .maybeSingle();

  if (!row) {
    return new ImageResponse(
      <div style={fallbackStyle}>Marathon not found</div>,
      { width: 1200, height: 630 },
    );
  }

  const prices = Object.values(
    (row.printful_prices ?? {}) as Record<string, number>,
  );
  const fromPrice = prices.length
    ? `From $${(Math.min(...prices) / 100).toFixed(0)}`
    : '';

  const origin = new URL(req.url).origin;
  const thumbnailUrl = row.thumbnail_path
    ? `${origin}${row.thumbnail_path}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#f5f3ef',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            width: 480,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e8e6e0',
          }}
        >
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt=""
              width={360}
              height={480}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <div style={{ fontSize: 32, color: '#9c9c9c' }}>{row.city}</div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '80px 64px',
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: '#6b6b6b',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            Miles Away · Prints
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#dc2626',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 16,
            }}
          >
            For Runners
          </div>
          <div
            style={{
              fontSize: 64,
              color: '#0e0e0e',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            {row.city} Marathon
            <br />
            Print
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#6b6b6b',
              maxWidth: 480,
              marginBottom: 32,
            }}
          >
            Personalized with your name, bib, finish time, and race date.
          </div>
          {fromPrice && (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: '#0e0e0e',
                border: '1px solid #e8e6e0',
                padding: '12px 20px',
                borderRadius: 999,
                backgroundColor: '#ffffff',
                alignSelf: 'flex-start',
                marginTop: 'auto',
              }}
            >
              {fromPrice}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

const fallbackStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f3ef',
  fontSize: 48,
  color: '#0e0e0e',
  fontFamily: 'system-ui, -apple-system, sans-serif',
} as const;
