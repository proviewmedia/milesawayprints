'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, FileText, FileUp, Loader2, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import {
  ARTWORK_ACCEPT,
  ARTWORK_BUCKET,
  ARTWORK_MAX_BYTES,
  ARTWORK_PRINT_PRICES,
  ARTWORK_TYPE,
  BULK_PRINT_THRESHOLD,
  CUSTOM_PRINT_FLAG,
  MAX_DETAILS_LENGTH,
  sortSizes,
} from '@/data/custom-prints';
import { formatSize } from '@/data/shop';

/** Below this many pixels per inch a print will look soft. */
const MIN_PPI = 150;

interface Uploaded {
  path: string;
  name: string;
  isImage: boolean;
  /** Pixel size, images only. */
  px?: { w: number; h: number };
  previewUrl?: string;
}

function formatBytes(n: number) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function readPixels(url: string): Promise<{ w: number; h: number } | undefined> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(undefined);
    img.src = url;
  });
}

/** True when the image has fewer than MIN_PPI pixels per inch at this size,
 *  whichever way round it is printed. */
function isLowRes(px: { w: number; h: number }, size: string) {
  const [a, b] = size.split('x').map(Number);
  if (!a || !b) return false;
  const [short, long] = [Math.min(px.w, px.h), Math.max(px.w, px.h)];
  return short / Math.min(a, b) < MIN_PPI || long / Math.max(a, b) < MIN_PPI;
}

export default function ArtworkPrintBuilder({ onBulkQuote }: { onBulkQuote: (details: string) => void }) {
  const { addItem } = useCart();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<Uploaded | null>(null);
  const [uploading, setUploading] = useState<{ name: string; size: number } | null>(null);
  const [size, setSize] = useState('');
  const [details, setDetails] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizes = sortSizes(Object.keys(ARTWORK_PRINT_PRICES));
  const priceCents = size ? ARTWORK_PRINT_PRICES[size] : undefined;
  const lowRes = file?.px && size ? isLowRes(file.px, size) : false;

  useEffect(() => () => {
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
  }, [file]);

  const upload = async (f: File | undefined) => {
    if (fileInput.current) fileInput.current.value = '';
    if (!f) return;
    setError(null);
    if (!ARTWORK_ACCEPT[f.type]) return setError('Upload a JPG, PNG, TIFF, or PDF file.');
    if (f.size > ARTWORK_MAX_BYTES) return setError('Files can be up to 50 MB. Email us if yours is bigger.');

    setUploading({ name: f.name, size: f.size });
    try {
      const res = await fetch('/api/uploads/artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: f.name, contentType: f.type, size: f.size }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed. Please try again.');

      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.storage
        .from(ARTWORK_BUCKET)
        .uploadToSignedUrl(data.path, data.token, f, { contentType: f.type });
      if (upErr) throw new Error('Upload failed. Please try again.');

      const isImage = f.type.startsWith('image/') && f.type !== 'image/tiff';
      const previewUrl = isImage ? URL.createObjectURL(f) : undefined;
      const px = previewUrl ? await readPixels(previewUrl) : undefined;
      setFile({ path: data.path, name: f.name, isImage, px, previewUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleAdd = () => {
    if (!file) return setError('Upload your file first.');
    if (!size || !priceCents) return setError('Pick a size.');
    setError(null);
    addItem({
      slug: `custom-${ARTWORK_TYPE}-${Date.now()}`,
      type: ARTWORK_TYPE,
      name: 'Your artwork print',
      location: file.name,
      format: 'physical',
      size,
      priceCents,
      quantity: 1,
      isCustom: true,
      customization: {
        [CUSTOM_PRINT_FLAG]: 'true',
        custom_type: ARTWORK_TYPE,
        place: '',
        file_path: file.path,
        file_name: file.name.slice(0, 120),
        details: details.trim().slice(0, MAX_DETAILS_LENGTH),
      },
    });
    setAdded(true);
    setFile(null);
    setDetails('');
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">
      {/* Preview. On phones it only appears once there is something to show,
          so the upload button is not pushed below the fold. */}
      <div className={`md:sticky md:top-28 ${file || uploading ? '' : 'hidden md:block'}`}>
        <div className="relative aspect-[4/5] bg-soft border border-ink overflow-hidden flex items-center justify-center">
          {file?.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.previewUrl} alt="Your uploaded artwork" className="max-w-full max-h-full object-contain p-8" />
          ) : file ? (
            <div className="text-center px-6">
              <FileText size={40} strokeWidth={1.5} className="mx-auto text-ink mb-3" aria-hidden="true" />
              <p className="text-sm font-bold text-ink break-all">{file.name}</p>
              <p className="text-[13px] text-mid mt-1">Uploaded. We check every file before it prints.</p>
            </div>
          ) : (
            <div className="text-center px-6">
              <FileUp size={40} strokeWidth={1.5} className="mx-auto text-ink/30 mb-3" aria-hidden="true" />
              <p className="text-sm text-mid">Your artwork shows here</p>
            </div>
          )}
        </div>
        <p className="text-[13px] text-mid mt-3">
          Photos, illustrations, posters, or designs. Printed on museum-quality matte paper.
        </p>
      </div>

      <div>
        {/* 01 File */}
        <div className="mb-8">
          <p className="eyebrow text-mid mb-3">01 · Your file</p>
          {uploading ? (
            <div className="flex items-center gap-3 border-2 border-ink/15 rounded-lg px-4 py-4">
              <Loader2 size={18} className="animate-spin text-ink" aria-hidden="true" />
              <span className="text-sm text-ink truncate">
                Uploading {uploading.name} ({formatBytes(uploading.size)})
              </span>
            </div>
          ) : file ? (
            <div className="flex items-center gap-3 border-2 border-ink rounded-lg px-4 py-3">
              <Check size={18} strokeWidth={2.25} className="text-ink shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold text-ink truncate flex-1">{file.name}</span>
              {file.px && (
                <span className="text-[13px] text-mid shrink-0">
                  {file.px.w} × {file.px.h}px
                </span>
              )}
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove file"
                className="w-8 h-8 rounded-full hover:bg-soft flex items-center justify-center shrink-0"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="w-full border-2 border-dashed border-ink/25 hover:border-ink rounded-lg px-4 py-8 text-center transition-colors"
            >
              <FileUp size={22} className="mx-auto text-ink mb-2" aria-hidden="true" />
              <span className="block text-sm font-bold text-ink">Upload your file</span>
              <span className="block text-[13px] text-mid mt-1">JPG, PNG, TIFF, or PDF, up to 50 MB</span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept={Object.keys(ARTWORK_ACCEPT).join(',')}
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload your file"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <label htmlFor="ap-details" className="block text-[13px] font-medium text-ink mt-4 mb-2">
            Anything we should know? <span className="font-normal text-mid">Optional</span>
          </label>
          <textarea
            id="ap-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={MAX_DETAILS_LENGTH}
            rows={2}
            placeholder="Crop it to the faces, add a white border, it is a gift..."
            className="input-field resize-y"
          />
        </div>

        {/* 02 Size */}
        <fieldset className="mb-8">
          <legend className="eyebrow text-mid mb-3">
            02 · Size {size && <span className="normal-case tracking-normal font-normal">({formatSize(size)})</span>}
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setError(null);
                }}
                aria-pressed={size === s}
                className={`min-h-[52px] px-3 py-2 rounded-lg border-2 text-left transition-colors ${
                  size === s ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink hover:border-ink'
                }`}
              >
                <span className="block text-sm font-bold">{s}</span>
                <span className={`block text-[13px] ${size === s ? 'text-paper/75' : 'text-mid'}`}>
                  ${(ARTWORK_PRINT_PRICES[s] / 100).toFixed(0)}
                </span>
              </button>
            ))}
          </div>
          {lowRes && (
            <p className="flex gap-2 text-[13px] text-ink mt-3 leading-snug" role="status">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
              This image may look soft at {size}. A smaller size will print sharper, or send a larger file.
            </p>
          )}
        </fieldset>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!!uploading}
          aria-live="polite"
          className={`w-full py-4 rounded-full text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 ${
            added ? 'bg-mint text-paper' : 'bg-ink text-paper hover:bg-black'
          }`}
        >
          {added ? (
            <>
              <Check size={16} strokeWidth={2.25} aria-hidden="true" /> Added to cart
            </>
          ) : priceCents ? (
            `Add to cart · $${(priceCents / 100).toFixed(2)}`
          ) : (
            'Add to cart'
          )}
        </button>
        {error && (
          <p className="text-[13px] text-coral mt-3" role="alert">
            {error}
          </p>
        )}
        <p className="text-[13px] text-mid mt-4 leading-relaxed">
          We check every file before it prints and email you if anything needs fixing. Ships in 3 to 5 business
          days after that.
        </p>
        <p className="text-[13px] text-mid mt-2">
          Need {BULK_PRINT_THRESHOLD} or more?{' '}
          <button
            type="button"
            onClick={() =>
              onBulkQuote(
                `Bulk prints of my own artwork${size ? `, ${size}` : ''}${file ? ` (file: ${file.name})` : ''}.${
                  details.trim() ? ` ${details.trim()}` : ''
                }`,
              )
            }
            className="text-ink underline underline-offset-2 font-medium"
          >
            Get a quote
          </button>
        </p>
      </div>
    </div>
  );
}
