import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // توجيه مستخدم الصفحة الرئيسية للـ Login لو مفيش session token في الكوكيز
  const token = req.cookies.get('sb-access-token')?.value || req.cookies.get('supabase-auth-token')?.value;

  const isAuthPage = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup' || req.nextUrl.pathname === '/forgot-password';

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/profile/:path*', '/friends/:path*', '/groups/:path*', '/reels/:path*', '/messages/:path*'],
};