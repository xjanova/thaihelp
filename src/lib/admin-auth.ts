import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE = 'thaihelp_admin_token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Default admin credentials (first-time setup)
// Change these in .env.local!
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'ThaiHelp@2026!';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'thaihelp-secret-key-change-me';

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', ADMIN_SECRET).update(password).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// In-memory token store (replace with DB/Redis in production)
const tokenStore = new Map<string, { expires: number }>();

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export function createSession(): string {
  const token = generateToken();
  tokenStore.set(token, { expires: Date.now() + TOKEN_EXPIRY });
  return token;
}

export function validateToken(token: string): boolean {
  const session = tokenStore.get(token);
  if (!session) return false;
  if (Date.now() > session.expires) {
    tokenStore.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string): void {
  tokenStore.delete(token);
}

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value || null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  if (!token) return false;
  return validateToken(token);
}

export { ADMIN_COOKIE };
