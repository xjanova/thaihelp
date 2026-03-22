import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'thaihelp_admin_token';

// Admin page routes that require authentication
const PROTECTED_PAGES = [
  '/admin/dashboard',
  '/admin/reports',
  '/admin/incidents',
  '/admin/users',
  '/admin/settings',
  '/admin/setup',
];

// Admin API routes that require authentication
const PROTECTED_API = [
  '/api/admin/stats',
  '/api/admin/reports',
  '/api/admin/incidents',
  '/api/admin/settings',
];

// Routes explicitly excluded from protection (login / logout endpoints)
const PUBLIC_ADMIN_ROUTES = [
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public admin routes so the login page is always accessible
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  const isProtectedPage = PROTECTED_PAGES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isProtectedApi = PROTECTED_API.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedPage || isProtectedApi) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;

    if (!token) {
      // For API routes return 401; for page routes redirect to login
      if (isProtectedApi) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
