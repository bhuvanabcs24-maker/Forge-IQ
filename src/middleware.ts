import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    return;
  }

  // Strictly protect all Customer Portal routes from direct unauthenticated access
  if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
    const customerSession = request.cookies.get('forgeiq_customer_session');
    if (!customerSession || customerSession.value !== 'true') {
      const loginUrl = new URL('/portal/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Prevent customer portal users from accessing internal manager settings
  if (pathname.startsWith('/settings')) {
    const customerSession = request.cookies.get('forgeiq_customer_session');
    if (customerSession?.value === 'true') {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
