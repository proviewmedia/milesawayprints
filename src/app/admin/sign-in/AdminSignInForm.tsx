'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { isAdminEmail } from '@/lib/admin';

interface Props {
  initialError?: string;
  redirectTo: string;
}

export default function AdminSignInForm({ initialError, redirectTo }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === 'not_authorized'
      ? 'That account is not authorized for the admin dashboard.'
      : null,
  );
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) return;

    // Client-side gate so non-admin emails don't waste Supabase auth attempts
    // (the server-side layout still enforces the real check).
    if (!isAdminEmail(trimmedEmail)) {
      setError('That account is not authorized for the admin dashboard.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (signInErr) {
      setSubmitting(false);
      setError(signInErr.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
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
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="input-field pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mid hover:text-ink"
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
          </button>
        </div>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {error && <p className="text-sm text-coral">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-ink text-paper py-3 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
