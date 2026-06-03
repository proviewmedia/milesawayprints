import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PatchBody {
  status?: string;
  tracking_number?: string | null;
  printful_order_id?: string | null;
}

const ALLOWED_STATUS = new Set([
  'new',
  'paid',
  'in_progress',
  'in_production',
  'approved',
  'proof_sent',
  'shipped',
  'fulfilled',
  'delivered',
  'cancelled',
]);

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  // Re-check the admin gate on the server. The /admin/(protected)/layout
  // already does this for page renders, but API routes need their own check
  // since middleware doesn't gate them.
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderId = params.id;
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.status === 'string') {
    if (!ALLOWED_STATUS.has(body.status)) {
      return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
    }
    update.status = body.status;
    if (body.status === 'fulfilled' || body.status === 'shipped') {
      update.fulfilled_at = new Date().toISOString();
    }
  }
  if ('tracking_number' in body) {
    update.tracking_number = body.tracking_number?.toString().trim() || null;
  }
  if ('printful_order_id' in body) {
    update.printful_order_id = body.printful_order_id?.toString().trim() || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }
  update.updated_at = new Date().toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from('orders').update(update).eq('id', orderId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
