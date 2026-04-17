interface Props {
  children: React.ReactNode;
  /** compact = smaller padding (for grid cards); default for hero/detail */
  compact?: boolean;
  /** subtle hover lift animation wrapper */
  interactive?: boolean;
}

export default function WallFrame({ children, compact = false, interactive = false }: Props) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${
        compact
          ? 'shadow-[0_8px_24px_rgba(26,26,46,0.08)]'
          : 'shadow-[0_20px_60px_rgba(26,26,46,0.15)]'
      } ${
        interactive
          ? 'transition-all duration-300 group-hover:shadow-[0_24px_56px_rgba(26,26,46,0.18)] group-hover:-translate-y-1'
          : ''
      }`}
    >
      <div
        className="relative w-full"
        style={{
          background:
            'linear-gradient(180deg, #f0e8db 0%, #e8ddc7 60%, #dfd2b8 100%)',
          padding: compact ? '10%' : '12%',
        }}
      >
        <div className="relative">{children}</div>
        {/* subtle shadow under print to feel 3D */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[12%] bottom-[8%] h-[6%] rounded-full opacity-40 blur-md"
          style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)' }}
        />
      </div>
    </div>
  );
}
