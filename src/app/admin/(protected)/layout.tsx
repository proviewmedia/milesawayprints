import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isAdminEmail } from '@/lib/admin';
import AdminSignOutButton from '../AdminSignOutButton';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/sign-in');
  }
  if (!isAdminEmail(user.email)) {
    // Signed in as a customer — not authorized for admin. Force out so a
    // returning admin can sign in cleanly without the wrong cookie in play.
    await supabase.auth.signOut();
    redirect('/admin/sign-in?error=not_authorized');
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="bg-paper border-b border-border sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link href="/admin/orders" className="text-sm font-medium text-ink tracking-tight">
              Miles Away · Admin
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <NavLink href="/admin/orders">Orders</NavLink>
              <NavLink href="/admin/marathons">Marathons</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-mid hidden sm:inline">{user.email}</span>
            <AdminSignOutButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-mid hover:text-ink transition-colors"
    >
      {children}
    </Link>
  );
}
