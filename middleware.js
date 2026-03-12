import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = ['/dashboard'];
  // Routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register'];

  const token = request.cookies.get('token')?.value;

  if (protectedRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (authRoutes.some((r) => pathname.startsWith(r))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
