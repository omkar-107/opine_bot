import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from "next/headers";

export async function middleware(req) {
    const { nextUrl } = req;
    const cookieStore = cookies();
    const token = cookieStore.get(process.env.COOKIE_NAME || "auth");
    const { pathname } = nextUrl;

    // Create a response object
    let response;

    if (!token && pathname.startsWith('/login')) {
        response = NextResponse.next();
    } else if (!token) {
        response = NextResponse.redirect(new URL('/login', nextUrl.origin));
    } else {
        try {
            // Convert secret to Uint8Array for jose
            const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET);
            // Verify the token
            const { payload } = await jwtVerify(token.value, secretKey);
            const userRole = payload.user.role;

            if (pathname.startsWith('/login')) {
                if (userRole === 'faculty' || userRole === 'student') {
                    response = NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
                } else {
                    response = NextResponse.redirect(new URL('/admin', nextUrl.origin));
                }
            } else if (
                (pathname.startsWith('/api/admin') && userRole === 'admin') ||
                (pathname.startsWith('/api/faculty') && userRole === 'faculty') ||
                (pathname.startsWith('/api/student') && userRole === 'student')
            ) {
                response = NextResponse.next();
            } else if (
                (pathname.startsWith('/admin') && userRole === 'admin') ||
                (pathname.startsWith('/faculty') && userRole === 'faculty') ||
                (pathname.startsWith('/dashboard') && (userRole === 'student' || userRole === 'faculty')) ||
                (pathname.startsWith('/chat') && userRole === 'student')
            ) {
                response = NextResponse.next();
            } else {
                response = NextResponse.json(
                    { message: 'Unauthorized access: You do not have the required permissions' },
                    { status: 403 }
                );
            }
        } catch (error) {
            console.log('in error block', error);
            response = NextResponse.json(
                { message: 'Invalid or expired token', error: error.message },
                { status: 401 }
            );
        }
    }

    // Add cache control headers for GET requests
    if (req.method === 'GET') {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
    }

    return response;
}

export const config = {
    matcher: ['/api/admin/:path*', '/api/faculty/:path*', '/api/student/:path*', '/admin/:path*', '/faculty/:path*', '/dashboard', '/login', '/chat/:path*'],
};