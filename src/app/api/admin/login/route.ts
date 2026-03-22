import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession, ADMIN_COOKIE } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
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
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
