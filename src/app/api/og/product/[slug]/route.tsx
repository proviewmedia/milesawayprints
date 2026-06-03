import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/lib/supabase';
import { PRINT_CONFIGS, type PrintType } from '@/data/prints';
import { DEFAULT_DIGITAL_PRICE_CENTS } from '@/data/shop';

export const runtime = 'nodejs';
// Use node runtime so we can call Supabase client. Edge would require
// shipping the supabase-js bundle to the edge runtime which is heavier.
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('gallery_items')
    .select(
      'name, location, print_type_slug, image_url, printful_prices, digital_price_cents',
    )
    .eq('slug', params.slug)
    .eq('active', true)
    .maybeSingle();

  if (!row) {
    return fallbackOg('Print not found');
  }

  const typeLabel =
    PRINT_CONFIGS[row.print_type_slug as PrintType]?.detailsLabel ?? 'Print';

  const prices = (row.printful_prices ?? {}) as Record<string, number>;
  const physicalPrices = Object.values(prices);
  const cheapest = Math.min(
    row.digital_price_cents ?? DEFAULT_DIGITAL_PRICE_CENTS,
    ...(physicalPrices.length ? physicalPrices : [Infinity]),
  );
  const fromPrice = Number.isFinite(cheapest)
    ? `From $${(cheapest / 100).toFixed(0)}`
    : '';

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
        {/* Left: product image */}
        <div
          style={{
            width: 540,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e8e6e0',
          }}
        >
          {row.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.image_url}
              alt=""
              width={420}
              height={525}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                fontSize: 32,
                color: '#9c9c9c',
              }}
            >
              {row.name}
            </div>
          )}
        </div>

        {/* Right: text */}
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
              color: '#6b6b6b',
              marginBottom: 16,
            }}
          >
            {typeLabel}
          </div>
          <div
            style={{
              fontSize: 64,
              color: '#0e0e0e',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 500,
              marginBottom: 16,
              maxWidth: 540,
            }}
          >
            {row.name}
          </div>
          {row.location && (
            <div
              style={{
                fontSize: 24,
                color: '#6b6b6b',
                marginBottom: 32,
              }}
            >
              {row.location}
            </div>
          )}
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

function fallbackOg(text: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f3ef',
          fontSize: 48,
          color: '#0e0e0e',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {text}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
