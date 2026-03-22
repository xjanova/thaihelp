import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit: 3 login attempts per minute per IP
  const ip = getRateLimitKey(request);
  const limit = rateLimit(`admin-login:${ip}`, 3, 60000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: `ลองล็อกอินมากเกินไป กรุณารอ ${Math.ceil(limit.retryAfterMs / 1000)} วินาที` },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const token = createSession();
    const response = NextResponse.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });

    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
