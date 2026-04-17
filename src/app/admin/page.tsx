import Link from 'next/link';
import { Package, Clock, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// TODO: wrap this page in auth middleware before going live.
// For now it's public while we're in pre-launch dev mode.
async function getOrders() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    return data ?? [];
  } catch {
    return [];
  }
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-primary-light text-primary',
  in_progress: 'bg-warm-light text-warm',
  proof_sent: 'bg-lavender-light text-lavender',
  approved: 'bg-mint-light text-mint',
  fulfilled: 'bg-soft text-mid',
  cancelled: 'bg-coral-light text-coral',
};

export default async function AdminPage() {
  const orders = await getOrders();

  const counts = {
    new: orders.filter((o) => o.status === 'new').length,
    in_progress: orders.filter((o) => o.status === 'in_progress').length,
    proof_sent: orders.filter((o) => o.status === 'proof_sent').length,
    fulfilled: orders.filter((o) => o.status === 'fulfilled').length,
  };

  return (
    <>
      <Navbar />
      <section className="pt-28 pb-16 bg-soft min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
                Admin
              </h1>
              <p className="text-sm text-mid">Orders, fulfillment, and proof workflow.</p>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full bg-warm-light text-warm font-semibold">
              Dev mode · auth not yet wired
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="New" count={counts.new} icon={<Clock size={16} />} color="primary" />
            <StatCard label="In Progress" count={counts.in_progress} icon={<Package size={16} />} color="warm" />
            <StatCard label="Proofs Out" count={counts.proof_sent} icon={<Mail size={16} />} color="lavender" />
            <StatCard label="Fulfilled" count={counts.fulfilled} icon={<CheckCircle2 size={16} />} color="mint" />
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-ink">Recent orders</h2>
              <span className="text-xs text-mid">{orders.length} shown</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-mid text-sm mb-2">No orders yet.</p>
                <p className="text-xs text-light-mid">
                  Orders will appear here once customers place them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-soft text-[10px] font-bold tracking-wider uppercase text-mid">
                    <tr>
                      <th className="px-5 py-3 text-left">Order</th>
                      <th className="px-5 py-3 text-left">Customer</th>
                      <th className="px-5 py-3 text-left">Design</th>
                      <th className="px-5 py-3 text-left">Format</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-right">Total</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-border hover:bg-soft/60">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-ink">#{o.order_number}</div>
                          <div className="text-xs text-mid">
                            {new Date(o.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-ink">{o.customer_name}</div>
                          <div className="text-xs text-mid truncate max-w-[180px]">
                            {o.customer_email}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-ink">
                            {o.customization?.name ?? o.print_type_slug}
                          </div>
                          <div className="text-xs text-mid">
                            {o.customization?.location ?? ''}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-mid capitalize">
                          {o.format} · {o.size}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              STATUS_COLORS[o.status] ?? 'bg-soft text-mid'
                            }`}
                          >
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-ink">
                          ${(o.price_cents / 100).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/order/${o.token}`}
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 p-5 bg-white rounded-2xl border border-border">
            <div className="text-xs font-bold tracking-wider uppercase text-primary mb-1">
              Fulfillment workflow
            </div>
            <p className="text-sm text-mid leading-relaxed">
              For physical orders, copy the customer shipping address + design name into Printful dashboard manually and submit there. Printful API auto-submission is queued for Phase 4.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function StatCard({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: 'primary' | 'warm' | 'lavender' | 'mint';
}) {
  const bg = {
    primary: 'bg-primary-light',
    warm: 'bg-warm-light',
    lavender: 'bg-lavender-light',
    mint: 'bg-mint-light',
  }[color];
  const fg = {
    primary: 'text-primary',
    warm: 'text-warm',
    lavender: 'text-lavender',
    mint: 'text-mint',
  }[color];

  return (
    <div className="bg-white rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full ${bg} ${fg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-mid uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-ink">{count}</div>
    </div>
  );
}
