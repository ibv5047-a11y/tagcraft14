import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Keeps signed-out visitors out of /dashboard. API routes check the session themselves.
export async function middleware(request) {
  const token = request.cookies.get('tagcraft_session')?.value;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      return NextResponse.next();
    } catch {
      // fall through to redirect
    }
  }
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = { matcher: ['/dashboard/:path*'] };
