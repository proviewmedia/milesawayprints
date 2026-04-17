import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle2, Package, Truck, Download, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

const STATUS_STEPS = [
  { key: 'new', label: 'Received', icon: CheckCircle2 },
  { key: 'in_progress', label: 'Designing', icon: Clock },
  { key: 'proof_sent', label: 'Proof Sent', icon: Mail },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'fulfilled', label: 'Fulfilled', icon: Package },
];

export default async function OrderPage({ params }: { params: { token: string } }) {
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('token', params.token)
    .maybeSingle();

  if (!order) notFound();

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isDigital = order.format === 'digital';

  return (
    <>
      <Navbar />
      <section className="pt-28 pb-20 bg-soft min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-border">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-primary mb-1">
                  Order #{order.order_number}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                  {order.customization?.name ?? order.print_type_slug}
                </h1>
                <p className="text-sm text-mid mt-1">
                  {order.customization?.location ?? ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-mid">Total</div>
                <div className="text-2xl font-extrabold text-ink">
                  ${(order.price_cents / 100).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div className="mb-8">
              <div className="text-xs font-bold tracking-wider uppercase text-mid mb-4">Status</div>
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all ${
                          done
                            ? 'bg-primary text-white'
                            : 'bg-soft text-mid border border-border'
                        } ${active ? 'ring-4 ring-primary-light' : ''}`}
                      >
                        <Icon size={14} />
                      </div>
                      <span
                        className={`text-[10px] md:text-xs font-semibold text-center ${
                          done ? 'text-ink' : 'text-mid'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
                {/* connecting line */}
                <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-border" />
                <div
                  className="absolute top-[18px] left-0 h-0.5 bg-primary transition-all"
                  style={{
                    width: `${(Math.max(0, currentIdx) / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 p-5 bg-soft rounded-2xl">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-mid mb-2">Format</div>
                <div className="font-semibold text-ink capitalize">{order.format} · {order.size}</div>
              </div>
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-mid mb-2">Customer</div>
                <div className="font-semibold text-ink">{order.customer_name}</div>
                <div className="text-xs text-mid">{order.customer_email}</div>
              </div>
              {order.is_gift && (
                <div className="md:col-span-2">
                  <div className="text-xs font-bold tracking-wider uppercase text-mid mb-2">Gift message</div>
                  <div className="text-sm text-ink italic">&ldquo;{order.gift_message}&rdquo;</div>
                </div>
              )}
              {order.tracking_number && (
                <div className="md:col-span-2 flex items-center gap-2">
                  <Truck size={14} className="text-primary" />
                  <span className="text-sm font-semibold text-ink">Tracking: </span>
                  <span className="text-sm text-mid">{order.tracking_number}</span>
                </div>
              )}
            </div>

            {/* Digital download */}
            {isDigital && order.digital_download_url && order.status === 'approved' && (
              <a
                href={order.digital_download_url}
                className="mt-6 btn-primary w-full justify-center"
                download
              >
                <Download size={14} /> Download your print
              </a>
            )}
          </div>

          <div className="text-center mt-6">
            <Link href="/shop" className="text-xs font-semibold text-mid hover:text-primary">
              Keep browsing the shop →
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
