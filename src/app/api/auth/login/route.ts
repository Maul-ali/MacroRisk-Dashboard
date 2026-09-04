import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '@/lib/db/neonClient';
import { verifyPassword, hashPassword, createSessionToken, AUTH_COOKIE_NAME, AuthUser } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user by email
    let rows = await queryNeon(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1 LIMIT 1;',
      [normalizedEmail]
    );

    // Auto-seed default admin if database users table is empty and admin is logging in
    if (rows.length === 0 && normalizedEmail === 'admin@fertilizer-indo.com' && password === 'admin123') {
      const defaultHash = await hashPassword('admin123');
      const inserted = await queryNeon(
        `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
         VALUES ('usr-admin-01', 'Budi Santoso', 'admin@fertilizer-indo.com', $1, 'Chief Risk Officer', NOW(), NOW())
         RETURNING id, name, email, password_hash, role;`,
        [defaultHash]
      );
      rows = inserted;
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const dbUser = rows[0];
    const isValidPassword = await verifyPassword(password, dbUser.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const user: AuthUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role || 'Analyst',
    };

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
