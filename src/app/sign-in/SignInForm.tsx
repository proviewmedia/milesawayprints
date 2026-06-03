'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Mode = 'signin' | 'signup';
type Status = 'idle' | 'submitting' | 'confirm-sent' | 'error';

export default function SignInForm() {
  const searchParams = useSearchParams();
  // Pre-fill from `?email=` (used by the post-purchase "Create account" CTA)
  // and start in signup mode if an email was passed in.
  const presetEmail = searchParams.get('email') ?? '';
  const [mode, setMode] = useState<Mode>(presetEmail ? 'signup' : 'signin');
  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setStatus('submitting');
    setErrorMsg(null);

    const supabase = createSupabaseBrowserClient();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }
      router.push('/account');
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }
      // If the project requires email confirmation, session is null and
      // we show a 'check your email' state. Otherwise sign the user in.
      if (data.session) {
        router.push('/account');
        router.refresh();
      } else {
        setStatus('confirm-sent');
      }
    }
  };

  if (status === 'confirm-sent') {
    return (
      <div className="border border-border p-6 text-center">
        <h2 className="text-lg text-ink mb-2">Check your email</h2>
        <p className="text-sm text-mid leading-relaxed">
          We sent a confirmation link to{' '}
          <strong className="text-ink">{email}</strong>. Click the link to verify
          your account, then come back and sign in.
        </p>
        <button
          onClick={() => {
            setMode('signin');
            setPassword('');
            setStatus('idle');
          }}
          className="mt-6 text-sm text-ink underline underline-offset-2 hover:opacity-70"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-ink">Password</label>
          {mode === 'signin' && (
            <Link
              href="/forgot-password"
              className="text-[12px] text-mid hover:text-ink underline underline-offset-2"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signin' ? 'Your password' : 'Pick a password (8+ characters)'}
            minLength={mode === 'signup' ? 8 : undefined}
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
        {errorMsg && <p className="text-sm text-accent">{errorMsg}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-ink text-paper py-3.5 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        {status === 'submitting'
          ? mode === 'signin'
            ? 'Signing in…'
            : 'Creating account…'
          : mode === 'signin'
          ? 'Sign in'
          : 'Create account'}
      </button>

      <p className="text-[13px] text-mid text-center pt-2">
        {mode === 'signin' ? (
          <>
            New here?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStatus('idle');
                setErrorMsg(null);
              }}
              className="text-ink underline underline-offset-2 hover:opacity-70"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setStatus('idle');
                setErrorMsg(null);
              }}
              className="text-ink underline underline-offset-2 hover:opacity-70"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </form>
  );
}
