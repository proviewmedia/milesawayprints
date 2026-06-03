'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setStatus('submitting');
    setErrorMsg(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('sent');
  };

  if (status === 'sent') {
    return (
      <div className="border border-border p-6 text-center rounded-2xl">
        <h2 className="text-lg text-ink mb-2">Check your email</h2>
        <p className="text-sm text-mid leading-relaxed">
          If an account exists for{' '}
          <strong className="text-ink">{email}</strong>, we&apos;ve sent a link
          to set a new password. The link expires in 1 hour.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block text-sm text-ink underline underline-offset-2 hover:opacity-70"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Email</label>
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>

      <div role="status" aria-live="polite" aria-atomic="true">
        {errorMsg && <p className="text-sm text-coral">{errorMsg}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-ink text-paper py-3.5 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-[13px] text-mid text-center pt-2">
        Remember your password?{' '}
        <Link
          href="/sign-in"
          className="text-ink underline underline-offset-2 hover:opacity-70"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
