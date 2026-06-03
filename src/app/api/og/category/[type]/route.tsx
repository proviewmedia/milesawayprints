import { ImageResponse } from 'next/og';
import { PRINT_CONFIGS, type PrintType } from '@/data/prints';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 86400;

const VALID_TYPES = new Set<PrintType>([
  'golf',
  'stadium',
  'airport',
  'marathon',
  'city',
  'skyline',
  'f1',
]);

export async function GET(
  _req: Request,
  { params }: { params: { type: string } },
) {
  if (!VALID_TYPES.has(params.type as PrintType)) {
    return new ImageResponse(
      <div style={fallbackStyle}>Not found</div>,
      { width: 1200, height: 630 },
    );
  }
  const cfg = PRINT_CONFIGS[params.type as PrintType];

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
            color: cfg.badgeColor.text,
            backgroundColor: cfg.badgeColor.bg,
            padding: '6px 14px',
            borderRadius: 999,
            alignSelf: 'flex-start',
            marginBottom: 32,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {cfg.badge}
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
            fontSize: 28,
            color: '#6b6b6b',
            lineHeight: 1.3,
            maxWidth: 960,
          }}
        >
          {cfg.lede}
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
          Personalized · Made to order · Shipped worldwide
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
