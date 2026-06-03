'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function AdminSignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/sign-in');
    router.refresh();
  };

  return (
    <button
      onClick={signOut}
      disabled={busy}
      className="text-xs text-mid hover:text-ink transition-colors disabled:opacity-50"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
