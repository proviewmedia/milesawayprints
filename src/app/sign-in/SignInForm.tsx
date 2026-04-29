'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');
    setErrorMsg(null);

    const supabase = createSupabaseBrowserClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-border p-6 text-center">
        <h2 className="text-lg text-ink mb-2">Check your email</h2>
        <p className="text-sm text-mid leading-relaxed">
          We sent a magic link to <strong className="text-ink">{email}</strong>.
          Click the link in your inbox to sign in. The link is good for an hour.
        </p>
        <button
          onClick={() => {
            setEmail('');
            setStatus('idle');
          }}
          className="mt-6 text-sm text-ink underline underline-offset-2 hover:opacity-70"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-ink mb-2">Email</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>
      {errorMsg && (
        <p className="text-sm text-accent">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-ink text-paper py-3.5 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send magic link'}
      </button>
      <p className="text-[12px] text-mid text-center pt-2">
        No password needed. We&apos;ll create your account automatically on first sign-in.
      </p>
    </form>
  );
}
