import { PrintType } from '@/data/prints';

type Values = Record<string, string>;

interface Props {
  type: PrintType;
  values: Values;
  className?: string;
}

export default function PrintPreview({ type, values, className = '' }: Props) {
  const components: Record<PrintType, React.FC<{ values: Values }>> = {
    golf: GolfPreview,
    stadium: StadiumPreview,
    airport: AirportPreview,
    marathon: MarathonPreview,
    city: CityPreview,
  };
  const Preview = components[type];
  return (
    <div className={`w-full aspect-[3/4] bg-[#f7f3ea] rounded-sm shadow-xl ${className}`}>
      <Preview values={values} />
    </div>
  );
}

function Frame({ children, title, location, stats, statLabels }: {
  children: React.ReactNode;
  title: string;
  location: string;
  stats: [string, string, string];
  statLabels: [string, string, string];
}) {
  return (
    <div className="w-full h-full flex flex-col items-center px-[8%] py-[10%] text-ink">
      <div className="text-center">
        <h2 className="font-extrabold tracking-[0.15em] uppercase text-[2.2cqw] leading-tight">
          {title || 'Your Location'}
        </h2>
        <p className="mt-1 text-[1.2cqw] tracking-[0.3em] uppercase text-mid">
          {location || '—'}
        </p>
      </div>
      <div className="flex-1 w-full flex items-center justify-center my-[4%]">
        {children}
      </div>
      <div className="w-full grid grid-cols-3 gap-2 border-t border-ink/15 pt-[3%]">
        {([0, 1, 2] as const).map(i => (
          <div key={i} className="text-center">
            <div className="text-[0.9cqw] tracking-[0.2em] uppercase text-mid">{statLabels[i]}</div>
            <div className="font-bold text-[1.4cqw] mt-0.5">{stats[i] || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GolfPreview({ values }: { values: Values }) {
  return (
    <Frame
      title={values.name || 'Custom Golf Course'}
      location={values.location || 'Location'}
      stats={[values.stat1 || '', values.stat2 || '', values.stat3 || '']}
      statLabels={['Length', 'Par', 'Rating']}
    >
      <svg viewBox="0 0 200 220" className="w-[80%] h-auto">
        <g fill="#2d5f3f" opacity="0.9">
          <ellipse cx="60" cy="50" rx="22" ry="12" />
          <ellipse cx="120" cy="60" rx="18" ry="10" />
          <ellipse cx="150" cy="110" rx="26" ry="14" />
          <ellipse cx="100" cy="130" rx="20" ry="11" />
          <ellipse cx="50" cy="150" rx="24" ry="13" />
          <ellipse cx="130" cy="170" rx="22" ry="12" />
          <ellipse cx="80" cy="180" rx="16" ry="9" />
        </g>
        <g fill="#8fb878" opacity="0.7">
          <ellipse cx="60" cy="50" rx="14" ry="7" />
          <ellipse cx="120" cy="60" rx="11" ry="6" />
          <ellipse cx="150" cy="110" rx="16" ry="8" />
          <ellipse cx="100" cy="130" rx="12" ry="7" />
          <ellipse cx="50" cy="150" rx="15" ry="8" />
          <ellipse cx="130" cy="170" rx="14" ry="8" />
          <ellipse cx="80" cy="180" rx="10" ry="6" />
        </g>
        <g fill="#c9b78a">
          <circle cx="55" cy="48" r="3" />
          <circle cx="115" cy="58" r="2.5" />
          <circle cx="148" cy="108" r="3" />
          <circle cx="102" cy="128" r="2.5" />
          <circle cx="47" cy="152" r="3" />
          <circle cx="128" cy="168" r="2.5" />
        </g>
        <ellipse cx="90" cy="95" rx="18" ry="9" fill="#a8c8e1" opacity="0.7" />
      </svg>
    </Frame>
  );
}

function StadiumPreview({ values }: { values: Values }) {
  return (
    <Frame
      title={values.name || 'Custom Stadium'}
      location={values.location || 'Location'}
      stats={[values.stat1 || '', values.stat2 || '', values.stat3 || '']}
      statLabels={['Capacity', 'Opened', 'Location']}
    >
      <svg viewBox="0 0 200 200" className="w-[80%] h-auto">
        <ellipse cx="100" cy="100" rx="80" ry="70" fill="none" stroke="#1a1a2e" strokeWidth="4" />
        <ellipse cx="100" cy="100" rx="65" ry="55" fill="none" stroke="#1a1a2e" strokeWidth="2" />
        <ellipse cx="100" cy="100" rx="50" ry="42" fill="#2d5f3f" opacity="0.4" />
        <ellipse cx="100" cy="100" rx="50" ry="42" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        <rect x="85" y="88" width="30" height="24" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        <line x1="100" y1="58" x2="100" y2="142" stroke="#1a1a2e" strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="100" x2="150" y2="100" stroke="#1a1a2e" strokeWidth="0.5" opacity="0.3" />
      </svg>
    </Frame>
  );
}

function AirportPreview({ values }: { values: Values }) {
  return (
    <Frame
      title={values.name || 'Custom Airport'}
      location={values.location || 'Location'}
      stats={[values.stat1 || '', values.stat2 || '', values.stat3 || '']}
      statLabels={['Code', 'Runways', 'Elevation']}
    >
      <svg viewBox="0 0 200 220" className="w-[80%] h-auto">
        <g stroke="#1a1a2e" strokeWidth="3" fill="none">
          <line x1="30" y1="50" x2="170" y2="170" />
          <line x1="170" y1="50" x2="30" y2="170" />
          <line x1="30" y1="110" x2="170" y2="110" />
          <line x1="100" y1="30" x2="100" y2="190" />
        </g>
        <g fill="#1a1a2e">
          <rect x="95" y="95" width="10" height="30" />
          <circle cx="45" cy="60" r="3" />
          <circle cx="155" cy="60" r="3" />
          <circle cx="45" cy="160" r="3" />
          <circle cx="155" cy="160" r="3" />
        </g>
      </svg>
    </Frame>
  );
}

function MarathonPreview({ values }: { values: Values }) {
  return (
    <Frame
      title={values.name || 'Marathon Name'}
      location={values.location || 'Date'}
      stats={[values.stat1 || '', values.stat2 || '', values.stat3 || '']}
      statLabels={['Finish', 'Distance', 'Pace']}
    >
      <svg viewBox="0 0 200 220" className="w-[80%] h-auto">
        <path
          d="M 30 100 Q 50 40, 90 60 T 150 80 Q 180 90, 170 130 T 130 180 Q 90 190, 60 160 T 30 100"
          fill="none"
          stroke="#dc2626"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="30" cy="100" r="6" fill="#dc2626" />
        <circle cx="170" cy="130" r="6" fill="#1a1a2e" />
        <g fill="#1a1a2e" opacity="0.2">
          <circle cx="70" cy="60" r="2" />
          <circle cx="120" cy="70" r="2" />
          <circle cx="160" cy="110" r="2" />
          <circle cx="140" cy="170" r="2" />
        </g>
      </svg>
    </Frame>
  );
}

function CityPreview({ values }: { values: Values }) {
  return (
    <Frame
      title={values.name || 'Your City'}
      location={values.location || 'Country'}
      stats={[values.stat1 || '', values.stat2 || '', values.stat3 || '']}
      statLabels={['Lat', 'Long', 'Founded']}
    >
      <svg viewBox="0 0 200 200" className="w-[80%] h-auto">
        <g stroke="#1a1a2e" strokeWidth="1.2" fill="none">
          <line x1="20" y1="40" x2="180" y2="50" />
          <line x1="15" y1="80" x2="185" y2="78" />
          <line x1="20" y1="120" x2="180" y2="125" />
          <line x1="15" y1="160" x2="185" y2="155" />
          <line x1="40" y1="10" x2="30" y2="190" />
          <line x1="80" y1="10" x2="85" y2="190" />
          <line x1="130" y1="10" x2="125" y2="190" />
          <line x1="170" y1="10" x2="175" y2="190" />
        </g>
        <g stroke="#4f6df5" strokeWidth="2.5" fill="none" opacity="0.8">
          <path d="M 30 140 Q 60 120, 90 125 T 150 115 Q 170 110, 175 90" />
        </g>
        <circle cx="100" cy="100" r="5" fill="#dc2626" />
      </svg>
    </Frame>
  );
}
