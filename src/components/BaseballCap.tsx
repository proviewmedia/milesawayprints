import type { LucideProps } from 'lucide-react';

// Lucide has no baseball cap, so this is drawn in the same 24px line style
// (stroke 1.75 from ProductIcon, round caps and joins) to sit with the other icons.
export default function BaseballCap({ size = 24, strokeWidth = 2, className, ...rest }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <g transform="translate(12 12) scale(1.12) translate(-12.25 -12.85)">
        <path d="M3 15a7 7 0 0 1 14 0" />
        <path d="M3 15h12c4 0 6.5 1 6.5 2s-2.5 1.5-6 1.5H4.5A1.5 1.5 0 0 1 3 17z" />
        <path d="M10 8c-1.6 2-2.2 4.4-2.2 7" />
        <path d="M10 7.2V8" />
      </g>
    </svg>
  );
}
