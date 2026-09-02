import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '@/lib/db/neonClient';
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME, AuthUser } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, email, password } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama lengkap minimal 2 karakter.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already registered
    const existing = await queryNeon(
      'SELECT id FROM users WHERE email = $1 LIMIT 1;',
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.' },
        { status: 409 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const role = normalizedEmail.includes('admin') ? 'Risk Director' : 'Risk Analyst';

    const inserted = await queryNeon(
      `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, role;`,
      [userId, name.trim(), normalizedEmail, passwordHash, role]
    );

    const user: AuthUser = {
      id: inserted[0].id,
      name: inserted[0].name,
      email: inserted[0].email,
      role: inserted[0].role,
    };

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil!',
      user,
    });

    // Set HTTP-only session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat registrasi.' },
      { status: 500 }
    );
  }
}
