import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { DASHBOARD_HOSTNAME } from '@/lib/admin';

// Paths that should NOT be rewritten under the dashboard subdomain.
// API calls, Next internals, Supabase auth callback, and static assets all
// need to resolve at their original path regardless of hostname.
const PASS_THROUGH_PREFIXES = ['/api/', '/_next/', '/auth/', '/favicon'];

function shouldPassThrough(pathname: string): boolean {
  return PASS_THROUGH_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  const isDashboardHost = hostname === DASHBOARD_HOSTNAME;
  // Allow /admin on localhost and on raw Vercel deployment URLs (*.vercel.app)
  // so previews + local dev stay usable. The public www domain is the only
  // host that gets the block.
  const isPreviewOrLocal =
    hostname === 'localhost' || hostname.endsWith('.vercel.app');

  // Block the public storefront from serving /admin — defense in depth on
  // top of the layout-level auth check.
  if (!isDashboardHost && !isPreviewOrLocal && pathname.startsWith('/admin')) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Dashboard subdomain: internally rewrite the path under /admin so the
  // existing Next.js route tree handles it. e.g. dashboard.mi…com/orders
  // resolves /admin/orders. API routes and Next internals pass through.
  let res: NextResponse;
  if (isDashboardHost && !shouldPassThrough(pathname) && !pathname.startsWith('/admin')) {
    const target = pathname === '/' ? '/admin' : `/admin${pathname}`;
    const url = req.nextUrl.clone();
    url.pathname = target;
    res = NextResponse.rewrite(url);
  } else {
    res = NextResponse.next({ request: req });
  }

  // Supabase session refresh — runs for every request regardless of host
  // so cookies stay live for both the storefront and the dashboard.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
