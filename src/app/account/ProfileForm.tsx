'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  default_shipping_name: string | null;
  default_shipping_address_line1: string | null;
  default_shipping_address_line2: string | null;
  default_shipping_city: string | null;
  default_shipping_state: string | null;
  default_shipping_zip: string | null;
  default_shipping_country: string | null;
  default_shipping_phone: string | null;
}

interface Props {
  userId: string;
  email: string;
  initial: ProfileRow | null;
}

export default function ProfileForm({ userId, email, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [shippingName, setShippingName] = useState(initial?.default_shipping_name ?? '');
  const [line1, setLine1] = useState(initial?.default_shipping_address_line1 ?? '');
  const [line2, setLine2] = useState(initial?.default_shipping_address_line2 ?? '');
  const [city, setCity] = useState(initial?.default_shipping_city ?? '');
  const [stateCode, setStateCode] = useState(initial?.default_shipping_state ?? '');
  const [zip, setZip] = useState(initial?.default_shipping_zip ?? '');
  const [country, setCountry] = useState(initial?.default_shipping_country ?? 'US');
  const [phone, setPhone] = useState(initial?.default_shipping_phone ?? '');

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email,
        name: name || null,
        default_shipping_name: shippingName || null,
        default_shipping_address_line1: line1 || null,
        default_shipping_address_line2: line2 || null,
        default_shipping_city: city || null,
        default_shipping_state: stateCode || null,
        default_shipping_zip: zip || null,
        default_shipping_country: country || 'US',
        default_shipping_phone: phone || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-ink mb-2">Email</label>
        <input value={email} disabled className="input-field bg-soft text-mid" />
      </div>

      <div className="pt-2">
        <h3 className="text-[13px] font-medium text-ink uppercase tracking-wider mb-3">
          Default shipping
        </h3>
        <div className="space-y-3">
          <input
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
            placeholder="Recipient name"
            className="input-field"
          />
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Street address"
            className="input-field"
          />
          <input
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            placeholder="Apt, suite, etc. (optional)"
            className="input-field"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="input-field"
            />
            <input
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              placeholder="State"
              className="input-field"
              maxLength={2}
            />
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="ZIP"
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              className="input-field"
              maxLength={2}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {errorMsg && <p className="text-sm text-accent">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="bg-ink text-paper py-3 px-7 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save changes'}
      </button>
    </form>
  );
}
