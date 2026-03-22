import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import type { Incident, IncidentCategory } from '@/types';

const VALID_CATEGORIES: IncidentCategory[] = ['accident', 'flood', 'roadblock', 'checkpoint', 'construction', 'other'];

export async function GET() {
  try {
    let incidents: Incident[] = [];
    try {
      const rows = await query(
        `SELECT * FROM incidents
         WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY created_at DESC
         LIMIT 100`
      );
      incidents = rows.map((r) => ({
        id: r.id as number,
        userId: String(r.user_id || 'anonymous'),
        category: r.category as IncidentCategory,
        title: r.title as string,
        description: (r.description as string) || '',
        latitude: r.latitude as number,
        longitude: r.longitude as number,
        imageUrl: r.image_url as string | undefined,
        upvotes: (r.upvotes as number) || 0,
        isActive: Boolean(r.is_active),
        createdAt: new Date(r.created_at as string),
        expiresAt: new Date(r.expires_at as string),
      }));
    } catch {
      // DB not ready — return demo data
      incidents = getDemoIncidents();
    }

    return NextResponse.json({ success: true, data: incidents });
  } catch (error) {
    console.error('GET /api/incidents error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch incidents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = getRateLimitKey(request);
  const limit = rateLimit(`incidents-post:${ip}`, 5, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'แจ้งเหตุบ่อยเกินไป กรุณารอสักครู่' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { category, title, description, latitude, longitude } = body;

    if (!category || !title || !latitude || !longitude) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, error: 'ประเภทเหตุการณ์ไม่ถูกต้อง' }, { status: 400 });
    }
    if (typeof title === 'string' && title.length > 200) {
      return NextResponse.json({ success: false, error: 'หัวข้อยาวเกินไป' }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO incidents (category, title, description, latitude, longitude, expires_at)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 4 HOUR))`,
      [category, title, description || '', latitude, longitude]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.insertId, category, title, latitude, longitude },
    });
  } catch (error) {
    console.error('POST /api/incidents error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

function getDemoIncidents(): Incident[] {
  return [
    { id: 1, userId: 'demo', category: 'accident', title: 'รถชน 3 คัน', description: 'รถชนบริเวณแยก', latitude: 13.758, longitude: 100.568, upvotes: 15, isActive: true, createdAt: new Date(Date.now() - 1800000), expiresAt: new Date(Date.now() + 7200000) },
    { id: 2, userId: 'demo', category: 'flood', title: 'น้ำท่วมถนน', description: 'น้ำท่วมสูง 30 ซม.', latitude: 13.765, longitude: 100.555, upvotes: 8, isActive: true, createdAt: new Date(Date.now() - 3600000), expiresAt: new Date(Date.now() + 7200000) },
    { id: 3, userId: 'demo', category: 'checkpoint', title: 'จุดตรวจตำรวจ', description: 'ตั้งจุดตรวจเอกสาร', latitude: 13.750, longitude: 100.575, upvotes: 22, isActive: true, createdAt: new Date(Date.now() - 900000), expiresAt: new Date(Date.now() + 10800000) },
  ];
}
