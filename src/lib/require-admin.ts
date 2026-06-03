import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from './supabase-server';
import { isAdminEmail } from './admin';

/**
 * Guard for admin-only API routes. Middleware does NOT gate `/api/*`, so any
 * route that uses the service-role client (createAdminClient) must call this
 * first. Returns a 401 response to return early, or null when the caller is an
 * allow-listed admin.
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
