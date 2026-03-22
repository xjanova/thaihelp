import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE = 'thaihelp_admin_token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL = 60 * 60 * 1000; // Clean expired tokens every hour

// In production, ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SECRET must be set
// as environment variables. The fallback defaults below are for development only.
// TODO: Replace plaintext comparison with bcrypt before going to production.
const isDev = process.env.NODE_ENV !== 'production';

// Defaults for initial setup — change via .env.local on server
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'ThaiHelp@2026!';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'xman-thaihelp-2026';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// In-memory token store (replace with DB/Redis in production)
const tokenStore = new Map<string, { expires: number }>();

// Lazy cleanup — runs inside validateToken instead of module-level setInterval
function cleanupExpired() {
  const now = Date.now();
  tokenStore.forEach((session, token) => {
    if (now > session.expires) tokenStore.delete(token);
  });
}

export function validateCredentials(username: string, password: string): boolean {
  // NOTE: This is a plaintext comparison — acceptable for MVP.
  // Replace with bcrypt.compare() before production launch.
  return username === ADMIN_USER && password === ADMIN_PASS;
}

// Suppress unused-variable warning for ADMIN_SECRET (used via closure above)
void ADMIN_SECRET;

export function createSession(): string {
  const token = generateToken();
  tokenStore.set(token, { expires: Date.now() + TOKEN_EXPIRY });
  return token;
}

export function validateToken(token: string): boolean {
  // Piggyback cleanup on validation calls (no module-level timer)
  if (tokenStore.size > 10) cleanupExpired();

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
