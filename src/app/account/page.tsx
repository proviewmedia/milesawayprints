import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import SignOutButton from './SignOutButton';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your account — Miles Away Prints',
};

export default async function AccountPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, token, created_at, status, format, size, price_cents, print_type_slug, customer_name, shipping_city, shipping_state')
    .order('created_at', { ascending: false });

  return (
    <>
      <NavbarShell />
      <section className="pt-32 md:pt-36 pb-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-ink leading-[1.05] mb-1">
                Your account
              </h1>
              <p className="text-mid text-sm">{user.email}</p>
            </div>
            <SignOutButton />
          </div>

          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10">
            {/* Profile + default address */}
            <div>
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider mb-4">
                Profile
              </h2>
              <ProfileForm
                userId={user.id}
                email={user.email ?? ''}
                initial={profile ?? null}
              />
            </div>

            {/* Orders */}
            <div>
              <h2 className="text-[13px] font-medium text-ink uppercase tracking-wider mb-4">
                Orders
              </h2>
              {orders && orders.length > 0 ? (
                <div className="border-t border-border">
                  {orders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/order/${o.token}`}
                      className="flex items-center justify-between py-5 border-b border-border hover:bg-soft -mx-3 px-3 transition-colors"
                    >
                      <div>
                        <div className="text-sm text-ink">
                          Order #{o.order_number}
                        </div>
                        <div className="text-[13px] text-mid mt-0.5">
                          {new Date(o.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          · {o.print_type_slug} · {o.format}
                          {o.size ? ` · ${o.size}` : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-ink">${(o.price_cents / 100).toFixed(2)}</div>
                        <div className="text-[12px] text-mid uppercase tracking-wider mt-0.5">
                          {o.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="border-t border-b border-border py-12 text-center">
                  <p className="text-mid text-sm mb-4">
                    No orders yet.
                  </p>
                  <Link href="/shop" className="btn-primary">
                    Shop the collection
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
