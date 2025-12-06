import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication and admin role
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Don't run middleware for admin routes
    // Let RoleGuard handle authentication on the client side
    // where cookies are properly accessible

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
    ],
};
