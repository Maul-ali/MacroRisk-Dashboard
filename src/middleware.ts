import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'fi_auth_session';
const AUTH_SECRET = process.env.AUTH_SECRET || 'macrorisk-super-secret-jwt-key-2026';

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
];

// Static / framework paths that should always pass through
const FRAMEWORK_PREFIXES = [
  '/_next',
  '/favicon',
  '/icon',
  '/apple-icon',
  '/manifest',
  '/robots',
  '/sitemap',
];

/**
 * Verify HMAC-SHA256 session token at the Edge using Web Crypto API.
 * Mirrors the format from src/lib/auth/auth.ts (base64url payload + "." + base64url HMAC).
 */
async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return false;

    // Import the secret key for HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the payload
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payloadStr)
    );

    // Convert ArrayBuffer to base64url
    const expectedSignature = bufferToBase64Url(signatureBuffer);

    if (signature !== expectedSignature) return false;

    // Check expiry
    const payloadJson = atob(base64UrlToBase64(payloadStr));
    const payload = JSON.parse(payloadJson);
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBase64(base64url: string): string {
  return base64url.replace(/-/g, '+').replace(/_/g, '/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow framework/static assets through
  if (FRAMEWORK_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow public paths through
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    // If user is authenticated and visiting /login or /register, redirect to /overview
    if (pathname === '/login' || pathname === '/register') {
      const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (token) {
        const isValid = await verifyTokenEdge(token);
        if (isValid) {
          return NextResponse.redirect(new URL('/overview', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // For all other routes, require authentication
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isValid = await verifyTokenEdge(token);

  if (!isValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    // Clear the invalid cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files.
     * This uses a negative lookahead to exclude Next.js internal static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
