'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface Props {
  email: string;
}

export default function AccountCallToAction({ email }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'authed'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setStatus('authed');
    });
  }, []);

  const handleSend = async () => {
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=/account` },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  if (status === 'authed') {
    return (
      <div className="border border-border p-5 text-left">
        <div className="text-sm text-ink mb-1">Saved to your account</div>
        <p className="text-[13px] text-mid leading-relaxed">
          We&apos;ve saved this order to <strong className="text-ink">{email}</strong>.
          You can view it any time at <a href="/account" className="underline underline-offset-2 hover:opacity-70">/account</a>.
        </p>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="border border-border p-5 text-left">
        <div className="text-sm text-ink mb-1">Check your email</div>
        <p className="text-[13px] text-mid leading-relaxed">
          We sent a sign-in link to <strong className="text-ink">{email}</strong>.
          Click it to view this order in your account at any time.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border p-5 text-left">
      <div className="text-sm text-ink mb-1">Save this to your account</div>
      <p className="text-[13px] text-mid leading-relaxed mb-4">
        We&apos;ll email <strong className="text-ink">{email}</strong> a one-click
        sign-in link so you can come back and view this order, save your shipping
        address, and order again later — no password needed.
      </p>
      <button
        onClick={handleSend}
        disabled={status === 'sending'}
        className="bg-ink text-paper py-2.5 px-5 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
      </button>
      {errorMsg && <p className="text-sm text-accent mt-3">{errorMsg}</p>}
    </div>
  );
}
