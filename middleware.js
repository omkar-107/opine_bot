import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from "next/headers";

export async function middleware(req) {
    const { nextUrl } = req;
    const cookieStore = cookies();
    const token = cookieStore.get(process.env.COOKIE_NAME || "auth");
    const { pathname } = nextUrl;

    if (!token && pathname.startsWith('/login')) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', nextUrl.origin));
    }

    try {
        // Convert secret to Uint8Array for jose
        const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET);

        // Verify the token
        const { payload } = await jwtVerify(token.value, secretKey);


        const userRole = payload.user.role;

        if (pathname.startsWith('/login')) {
            if (userRole === 'faculty' || userRole === 'student') {
                return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
            }
            else {
                return NextResponse.redirect(new URL('/admin', nextUrl.origin));
            }
        }

        // Check role-based access
        if (
            (pathname.startsWith('/api/admin') && userRole === 'admin') ||
            (pathname.startsWith('/api/faculty') && userRole === 'faculty') ||
            (pathname.startsWith('/api/student') && userRole === 'student')
        ) {
            return NextResponse.next();
        }
        else if (
            (pathname.startsWith('/admin') && userRole === 'admin') ||
            (pathname.startsWith('/faculty') && userRole === 'faculty') ||
            (pathname.startsWith('/dashboard') && (userRole === 'student' || userRole === 'faculty')) ||
            (pathname.startsWith('/chat') && userRole === 'student')
        ) {
            return NextResponse.next();
        }
        else {
            return NextResponse.json(
                { message: 'Unauthorized access: You do not have the required permissions' },
                { status: 403 }
            );
        }
    } catch (error) {
        console.log('in eroro block', error);
        return NextResponse.json(
            { message: 'Invalid or expired token', error: error.message },
            { status: 401 }
        );
    }
}

export const config = {
    matcher: ['/api/admin/:path*', '/api/faculty/:path*', '/api/student/:path*', '/admin/:path*', '/faculty/:path*', '/dashboard', '/login', '/chat/:path*'],
};