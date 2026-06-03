'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Status = 'verifying' | 'idle' | 'submitting' | 'success' | 'error' | 'expired';

export default function ResetPasswordForm() {
  // Supabase redirects here with a recovery session embedded in the URL
  // hash. The browser client auto-exchanges it on mount; we wait until
  // that's done before letting the user submit a new password.
  const [status, setStatus] = useState<Status>('verifying');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    // If a recovery hash was present in the URL, Supabase has already
    // exchanged it for a session by the time this effect runs.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('idle');
      } else {
        setStatus('expired');
      }
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setStatus('submitting');
    setErrorMsg(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('success');
    setTimeout(() => {
      router.push('/account');
      router.refresh();
    }, 1500);
  };

  if (status === 'verifying') {
    return (
      <div className="text-center text-sm text-mid">
        Verifying your reset link…
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="border border-border p-6 text-center rounded-2xl">
        <h2 className="text-lg text-ink mb-2">This link is no longer valid</h2>
        <p className="text-sm text-mid leading-relaxed mb-6">
          Reset links expire after 1 hour or can only be used once. Request a fresh one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors"
        >
          Send a new reset link
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="border border-border p-6 text-center rounded-2xl">
        <h2 className="text-lg text-ink mb-2">Password updated</h2>
        <p className="text-sm text-mid leading-relaxed">
          Taking you to your account…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          New password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Pick a password (8+ characters)"
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

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Confirm new password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Type it again"
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
        {status === 'submitting' ? 'Saving…' : 'Save new password'}
      </button>
    </form>
  );
}
