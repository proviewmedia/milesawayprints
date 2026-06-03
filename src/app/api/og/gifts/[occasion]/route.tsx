import { ImageResponse } from 'next/og';
import { GIFT_CONFIGS, GIFT_ORDER, type GiftOccasion } from '@/data/gifts';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 86400;

const VALID = new Set<string>(GIFT_ORDER);

export async function GET(
  _req: Request,
  { params }: { params: { occasion: string } },
) {
  if (!VALID.has(params.occasion)) {
    return new ImageResponse(<div style={fallbackStyle}>Not found</div>, {
      width: 1200,
      height: 630,
    });
  }
  const cfg = GIFT_CONFIGS[params.occasion as GiftOccasion];

  // Father's Day gets a golf-specific subtitle showcasing the iconic
  // course names — those are the keywords driving social shares + clicks.
  const isFathersDay = params.occasion === 'fathers-day';
  const subtitle = isFathersDay
    ? 'Pebble Beach · Old Course at St. Andrews · TPC Sawgrass · Tokyo · Quintero · Coeur d\'Alene'
    : cfg.lede.length > 200
    ? cfg.lede.slice(0, 197) + '…'
    : cfg.lede;
  const footerText = isFathersDay
    ? 'Custom golf course prints · Order by June 12 for Father\'s Day'
    : 'Personalized · Made to order · Shipped worldwide';

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
            fontSize: 22,
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
            display: 'flex',
            fontSize: 18,
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            padding: '6px 14px',
            borderRadius: 999,
            alignSelf: 'flex-start',
            marginBottom: 32,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Gifts
        </div>
        <div
          style={{
            fontSize: 84,
            color: '#0e0e0e',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontWeight: 500,
            marginBottom: 28,
            maxWidth: 1000,
          }}
        >
          {cfg.title}
        </div>
        <div
          style={{
            fontSize: isFathersDay ? 22 : 26,
            color: '#6b6b6b',
            lineHeight: 1.3,
            maxWidth: 960,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            color: '#0e0e0e',
            border: '1px solid #e8e6e0',
            padding: '10px 18px',
            borderRadius: 999,
            backgroundColor: '#ffffff',
            alignSelf: 'flex-start',
            marginTop: 'auto',
          }}
        >
          {footerText}
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
