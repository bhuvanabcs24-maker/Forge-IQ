import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Skip external network auth handshake for API routes or unconfigured placeholder credentials
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    supabaseUrl.includes('placeholder.supabase.co') ||
    supabaseAnonKey === 'placeholder-anon-key'
  ) {
    return supabaseResponse;
  }

  // Refresh auth session for UI pages when configured
  try {
    await supabase.auth.getUser();
  } catch {
    // Graceful fallback if network unreachable
  }

  return supabaseResponse;
}
