'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

const SIZES: [number, number][] = [
  [4, 6],
  [5, 7],
  [8, 10],
  [11, 14],
  [12, 18],
  [16, 20],
  [18, 24],
  [24, 36],
];

/** DPI when the image fills the print, cropping the longer side if the shapes differ. */
function fillDpi(w: number, h: number, a: number, b: number) {
  // Match the print's orientation to the image's.
  const [pw, ph] = w >= h ? [Math.max(a, b), Math.min(a, b)] : [Math.min(a, b), Math.max(a, b)];
  const dpi = Math.min(w / pw, h / ph);
  const cropped = Math.abs(w / h - pw / ph) / (pw / ph) > 0.02;
  return { dpi: Math.floor(dpi), cropped };
}

function rating(dpi: number) {
  if (dpi >= 300) return { label: 'Sharp', cls: 'bg-ink text-paper' };
  if (dpi >= 150) return { label: 'Good from a distance', cls: 'bg-soft text-ink border border-ink' };
  return { label: 'May look blurry', cls: 'bg-paper text-mid border border-border' };
}

const inches = (px: number, dpi: number) => (px / dpi).toFixed(1).replace(/\.0$/, '');

export default function PrintSizeCalculator() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  const valid = w > 0 && h > 0;

  function readImage(file: File) {
    // Read dimensions locally; the file never leaves the browser.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
      setFileName(file.name);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const input =
    'w-full rounded-lg border border-ink px-4 py-3 text-base text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-ink';

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
      <div className="rounded-xl border border-ink p-6">
        <h2 className="font-display font-black uppercase text-xl tracking-tight mb-1">Your image</h2>
        <p className="text-sm text-mid mb-5">Type the size in pixels, or pick the image to read it automatically.</p>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[13px] font-bold text-ink">Width (px)</span>
            <input
              inputMode="numeric"
              value={width}
              onChange={(e) => {
                setWidth(e.target.value.replace(/\D/g, ''));
                setFileName(null);
              }}
              placeholder="3000"
              className={`${input} mt-1.5`}
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-bold text-ink">Height (px)</span>
            <input
              inputMode="numeric"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value.replace(/\D/g, ''));
                setFileName(null);
              }}
              placeholder="4000"
              className={`${input} mt-1.5`}
            />
          </label>
        </div>

        <label className="mt-4 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink/40 px-4 py-4 text-sm font-bold text-ink cursor-pointer hover:border-ink transition-colors">
          <ImageIcon size={18} aria-hidden="true" />
          {fileName ? 'Pick a different image' : 'Pick an image instead'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readImage(f);
            }}
          />
        </label>
        {fileName && <p className="text-[13px] text-mid mt-2 break-all">Read from {fileName}</p>}
      </div>

      <div aria-live="polite">
        {!valid ? (
          <div className="rounded-xl bg-soft p-8 text-mid">Enter a width and height to see your print sizes.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-px bg-ink border border-ink rounded-xl overflow-hidden mb-8">
              <div className="bg-ink text-paper p-6">
                <div className="eyebrow text-paper/60 mb-3">Sharp up close · 300 DPI</div>
                <div className="display text-4xl md:text-5xl">
                  {inches(w, 300)} x {inches(h, 300)} in
                </div>
              </div>
              <div className="bg-paper p-6">
                <div className="eyebrow text-mid mb-3">Good from a distance · 150 DPI</div>
                <div className="display text-4xl md:text-5xl">
                  {inches(w, 150)} x {inches(h, 150)} in
                </div>
              </div>
            </div>

            <h2 className="eyebrow text-mid mb-4">Common print sizes</h2>
            <ul className="border-t border-ink">
              {SIZES.map(([a, b]) => {
                const { dpi, cropped } = fillDpi(w, h, a, b);
                const r = rating(dpi);
                return (
                  <li key={`${a}x${b}`} className="border-b border-ink py-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="font-display font-black uppercase text-xl tracking-tight w-28">
                      {a} x {b}
                    </span>
                    <span className={`text-[12px] font-bold rounded-full px-3 py-1 ${r.cls}`}>{r.label}</span>
                    <span className="text-sm text-mid">{dpi} DPI</span>
                    {cropped && <span className="text-[13px] text-mid sm:ml-auto">Different shape, some cropping</span>}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
