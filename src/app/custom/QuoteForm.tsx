'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, FileUp, X } from 'lucide-react';
import {
  CUSTOM_PRODUCTS,
  QUANTITY_OPTIONS,
  ARTWORK_OPTIONS,
  MAX_UPLOAD_BYTES,
  MAX_FILES,
  type ProductSlug,
  type ArtworkStatus,
} from '@/data/custom';

const ACCEPT = '.png,.jpg,.jpeg,.pdf,.svg,.ai,.eps,.psd,.webp,.heic';

function formatBytes(n: number) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Numbered section wrapper. Steps are visible all at once (no wizard) so the
 * customer can see the whole ask before starting, per NN/g's guidance on
 * setting expectations for form length.
 */
function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-border rounded-xl p-5 md:p-7 bg-paper">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-xs font-medium text-mid tabular-nums">0{n}</span>
        <h2 className="text-lg md:text-xl font-medium text-ink tracking-tight">{title}</h2>
      </div>
      {hint && <p className="text-sm text-mid mb-5 ml-7">{hint}</p>}
      <div className={hint ? '' : 'mt-5'}>{children}</div>
    </fieldset>
  );
}

export default function QuoteForm({ initialProduct }: { initialProduct?: ProductSlug }) {
  const openedAt = useRef<number>(Date.now());
  const fileInput = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<ProductSlug[]>(initialProduct ? [initialProduct] : []);
  const [quantity, setQuantity] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [artwork, setArtwork] = useState<ArtworkStatus | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [artworkLink, setArtworkLink] = useState('');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);

  const totalBytes = files.reduce((n, f) => n + f.size, 0);

  const toggleProduct = (slug: ProductSlug) =>
    setProducts((prev) => (prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_FILES);
    setFiles(next);
    setError(
      next.reduce((n, f) => n + f.size, 0) > MAX_UPLOAD_BYTES
        ? 'Your files are over 4 MB in total. Remove one, or paste a link instead.'
        : null,
    );
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Same checks as the API, in form order, so the first problem is the one shown.
    if (products.length === 0) return setError('Choose at least one product in step 1.');
    if (!quantity) return setError('Choose a quantity in step 2.');
    if (!artwork) return setError('Tell us where your design stands in step 3.');
    if (totalBytes > MAX_UPLOAD_BYTES) return setError('Your files are over 4 MB in total. Remove one, or paste a link instead.');
    if (!name.trim() || !email.trim()) return setError('Add your name and email in step 4 so we can send your quote.');

    setStatus('sending');
    setError(null);
    const body = new FormData();
    products.forEach((p) => body.append('products', p));
    body.append('quantity', quantity);
    body.append('neededBy', neededBy);
    body.append('artwork', artwork);
    body.append('artworkLink', artworkLink);
    body.append('details', details);
    body.append('name', name);
    body.append('email', email);
    body.append('phone', phone);
    body.append('organization', organization);
    body.append('website', website);
    body.append('openedAt', String(openedAt.current));
    files.forEach((f) => body.append('files', f));

    try {
      const res = await fetch('/api/quote', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus('sent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-border rounded-xl p-6 md:p-8 bg-paper">
        <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center mb-5">
          <Check size={20} strokeWidth={2} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-medium text-ink tracking-tight mb-2">Request sent.</h2>
        <p className="text-mid leading-relaxed mb-1">
          We will email your quote to <strong className="text-ink">{email}</strong> within 1 to 2 business days.
        </p>
        <p className="text-mid leading-relaxed mb-6">A copy of your request is on its way to your inbox now.</p>
        <Link href="/shop" className="btn-secondary">
          Browse the print collection
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Step n={1} title="What do you want printed?" hint="Pick everything that applies.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CUSTOM_PRODUCTS.map((p) => {
            const checked = products.includes(p.slug);
            return (
              <label
                key={p.slug}
                className={`relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  checked ? 'border-ink bg-soft' : 'border-border hover:border-ink/40'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={checked}
                  onChange={() => toggleProduct(p.slug)}
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 ${
                    checked ? 'bg-ink border-ink text-paper' : 'border-mid bg-paper'
                  }`}
                >
                  {checked && <Check size={14} strokeWidth={2.5} />}
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-ink">{p.name}</span>
                  <span className="block text-[13px] text-mid mt-0.5 leading-snug">{p.examples}</span>
                </span>
              </label>
            );
          })}
        </div>
      </Step>

      <Step n={2} title="How many, and by when?">
        <p className="text-[13px] font-medium text-ink mb-2">Quantity</p>
        <div className="flex flex-wrap gap-2 mb-6" role="radiogroup" aria-label="Quantity">
          {QUANTITY_OPTIONS.map((q) => (
            <label key={q} className="cursor-pointer">
              <input
                type="radio"
                name="quantity"
                value={q}
                checked={quantity === q}
                onChange={() => setQuantity(q)}
                className="sr-only peer"
              />
              <span className="inline-block px-4 py-2.5 rounded-full border text-sm transition-colors border-border text-ink peer-checked:bg-ink peer-checked:border-ink peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 hover:border-ink/40">
                {q}
              </span>
            </label>
          ))}
        </div>

        <label htmlFor="neededBy" className="block text-[13px] font-medium text-ink mb-2">
          Need it by <span className="font-normal text-mid">(optional)</span>
        </label>
        <input
          id="neededBy"
          type="date"
          value={neededBy}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setNeededBy(e.target.value)}
          className="input-field max-w-xs"
        />
        <p className="text-[13px] text-light-mid mt-2">Leave blank if there is no deadline.</p>
      </Step>

      <Step n={3} title="Your design">
        <div className="space-y-2 mb-6" role="radiogroup" aria-label="Design status">
          {ARTWORK_OPTIONS.map((a) => (
            <label
              key={a.value}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                artwork === a.value ? 'border-ink bg-soft' : 'border-border hover:border-ink/40'
              }`}
            >
              <input
                type="radio"
                name="artwork"
                value={a.value}
                checked={artwork === a.value}
                onChange={() => setArtwork(a.value)}
                className="mt-1 accent-ink w-4 h-4 shrink-0"
              />
              <span>
                <span className="block text-[15px] font-medium text-ink">{a.label}</span>
                <span className="block text-[13px] text-mid mt-0.5">{a.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <p className="text-[13px] font-medium text-ink mb-2">
          Files <span className="font-normal text-mid">(optional)</span>
        </p>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="w-full rounded-lg border border-dashed border-mid/60 hover:border-ink p-6 text-center transition-colors"
        >
          <FileUp size={20} strokeWidth={1.75} className="mx-auto text-ink mb-2" aria-hidden="true" />
          <span className="block text-sm font-medium text-ink">Upload artwork, sketches, or photos</span>
          <span className="block text-[13px] text-mid mt-1">
            PNG, JPG, PDF, SVG, AI, EPS. Up to {MAX_FILES} files, 4 MB total.
          </span>
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={(e) => addFiles(e.target.files)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-lg bg-soft px-4 py-2.5">
                <span className="text-sm text-ink truncate">{f.name}</span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-[13px] text-mid">{formatBytes(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    aria-label={`Remove ${f.name}`}
                    className="w-7 h-7 rounded-full hover:bg-paper flex items-center justify-center"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </span>
              </li>
            ))}
            <li className={`text-[13px] ${totalBytes > MAX_UPLOAD_BYTES ? 'text-accent' : 'text-light-mid'}`}>
              {formatBytes(totalBytes)} of 4 MB used
            </li>
          </ul>
        )}

        <label htmlFor="artworkLink" className="block text-[13px] font-medium text-ink mb-2 mt-6">
          Or paste a link <span className="font-normal text-mid">(optional)</span>
        </label>
        <input
          id="artworkLink"
          type="url"
          value={artworkLink}
          onChange={(e) => setArtworkLink(e.target.value)}
          placeholder="Google Drive, Dropbox, or WeTransfer link"
          className="input-field"
        />

        <label htmlFor="details" className="block text-[13px] font-medium text-ink mb-2 mt-6">
          Anything else? <span className="font-normal text-mid">(optional)</span>
        </label>
        <textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Colors, sizes, where the design goes, what it is for, or your budget."
          className="input-field min-h-[130px] resize-y"
          maxLength={5000}
        />
      </Step>

      <Step n={4} title="Where should we send your quote?">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-ink mb-2">Name</label>
            <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" maxLength={100} />
          </div>
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-ink mb-2">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-[13px] font-medium text-ink mb-2">
              Phone <span className="font-normal text-mid">(optional)</span>
            </label>
            <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" maxLength={40} />
          </div>
          <div>
            <label htmlFor="organization" className="block text-[13px] font-medium text-ink mb-2">
              Business or team <span className="font-normal text-mid">(optional)</span>
            </label>
            <input id="organization" autoComplete="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} className="input-field" maxLength={120} />
          </div>
        </div>
      </Step>

      {/* Honeypot: hidden from users, visible to bots */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] w-px h-px"
        aria-hidden="true"
      />

      <div ref={errorRef} aria-live="polite">
        {error && (
          <p className="rounded-lg border border-accent/30 bg-accent-light px-4 py-3 text-sm text-accent">{error}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
        <button type="submit" disabled={status === 'sending'} className="btn-primary disabled:opacity-60">
          {status === 'sending' ? 'Sending...' : 'Send quote request'}
        </button>
        <p className="text-[13px] text-mid">Free, with no commitment. You approve a proof before anything is printed.</p>
      </div>
    </form>
  );
}
