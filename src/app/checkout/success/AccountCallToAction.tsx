'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface Props {
  email: string;
}

export default function AccountCallToAction({ email }: Props) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setAuthed(true);
    });
  }, []);

  if (authed) {
    return (
      <div className="border border-border p-5 text-left">
        <div className="text-sm text-ink mb-1">Saved to your account</div>
        <p className="text-[13px] text-mid leading-relaxed">
          We&apos;ve saved this order to <strong className="text-ink">{email}</strong>.
          You can view it any time at{' '}
          <Link href="/account" className="underline underline-offset-2 hover:opacity-70">
            /account
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border p-5 text-left">
      <div className="text-sm text-ink mb-1">Want to track this order?</div>
      <p className="text-[13px] text-mid leading-relaxed mb-4">
        Create an account with <strong className="text-ink">{email}</strong> to view
        this order any time, save your shipping address, and order again faster.
      </p>
      <Link
        href={`/sign-in?email=${encodeURIComponent(email)}`}
        className="inline-block bg-ink text-paper py-2.5 px-5 rounded-full text-sm font-medium hover:bg-black transition-colors"
      >
        Create account
      </Link>
    </div>
  );
}
