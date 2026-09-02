import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil.',
  });

  // Clear session cookie
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
