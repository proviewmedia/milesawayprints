import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy proxies for the Supabase clients. Importing this file no longer
 * touches process.env, so Vercel's "collecting page data" phase doesn't
 * crash on routes that pre-import a Supabase client when env vars are
 * temporarily absent (e.g. a brand-new preview branch). Real env vars
 * are required at request time, where they'll throw a meaningful error
 * if missing.
 */

let _anon: SupabaseClient | null = null;
function getAnon(): SupabaseClient {
  if (_anon) return _anon;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  _anon = createClient(url, key);
  return _anon;
}

// Proxy that creates the client on first method access
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getAnon();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin env vars missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    );
  }
  return createClient(url, serviceRoleKey);
}
