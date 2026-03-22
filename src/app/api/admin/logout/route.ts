import { NextResponse } from 'next/server';
import { getAdminToken, destroySession, ADMIN_COOKIE } from '@/lib/admin-auth';

export async function POST() {
  const token = await getAdminToken();
  if (token) destroySession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
