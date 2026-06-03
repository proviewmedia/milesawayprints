import type { Metadata } from 'next';
import AdminSignInForm from './AdminSignInForm';

export const metadata: Metadata = {
  title: 'Admin sign in — Miles Away Prints',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { error?: string; redirect?: string };
}

export default function AdminSignInPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-soft flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xs font-medium tracking-widest uppercase text-mid mb-2">
            Miles Away
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">Admin</h1>
        </div>
        <div className="bg-paper border border-border rounded-2xl p-6 shadow-[0_2px_8px_rgba(26,26,46,0.04)]">
          <AdminSignInForm
            initialError={searchParams.error}
            redirectTo={searchParams.redirect ?? '/admin/orders'}
          />
        </div>
        <p className="text-[11px] text-center text-light-mid mt-6">
          Authorized accounts only.
        </p>
      </div>
    </div>
  );
}
