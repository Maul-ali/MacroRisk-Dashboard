import crypto from 'crypto';

export const AUTH_COOKIE_NAME = 'fi_auth_session';
const AUTH_SECRET = process.env.AUTH_SECRET || 'macrorisk-super-secret-jwt-key-2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ─── Password Hashing using PBKDF2 ───

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, storedHash?: string | null): Promise<boolean> {
  if (!storedHash || typeof storedHash !== 'string') return false;
  return new Promise((resolve, reject) => {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

// ─── Session Token (HMAC SHA-256) ───

export function createSessionToken(user: AuthUser, expiresInDays = 7): string {
  const payload = {
    ...user,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string): AuthUser | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadStr)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role || 'Analyst',
    };
  } catch {
    return null;
  }
}
