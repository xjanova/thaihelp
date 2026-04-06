import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { calculateDistance } from '@/lib/places';
import type { OilProducer, OilType, ShopCategory } from '@/types';

const VALID_OIL_TYPES: OilType[] = [
  'biodiesel', 'used_cooking_oil', 'palm_oil_fuel', 'ethanol',
  'diesel_blend', 'gasohol_blend', 'bio_gas', 'other',
];

const VALID_SHOP_CATEGORIES: ShopCategory[] = ['fuel', 'food', 'product', 'service'];

export async function GET(request: NextRequest) {
  const ip = getRateLimitKey(request);
  const limit = rateLimit(`oil-producers-get:${ip}`, 20, 60000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'คำขอมากเกินไป กรุณารอสักครู่' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '13.7563');
    const lng = parseFloat(searchParams.get('lng') || '100.5018');
    const radius = Math.min(Math.max(parseInt(searchParams.get('radius') || '') || 50, 1), 200); // km

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: any[] = [];
    try {
      rows = await query(
        `SELECT * FROM oil_producers WHERE is_active = 1 ORDER BY created_at DESC LIMIT 200`
      );
    } catch {
      // DB not ready — return empty
      return NextResponse.json({ success: true, data: [] });
    }

    const producers: OilProducer[] = rows
      .map((r) => {
        const dist = calculateDistance(lat, lng, r.latitude, r.longitude);
        return {
          id: r.id,
          shopName: r.shop_name,
          shopCategory: (r.shop_category || 'fuel') as ShopCategory,
          oilType: r.oil_type as OilType,
          oilTypeCustom: r.oil_type_custom || undefined,
          price: parseFloat(r.price),
          priceUnit: r.price_unit || 'บาท/ลิตร',
          latitude: r.latitude,
          longitude: r.longitude,
          phone: r.phone,
          logoUrl: r.logo_url || undefined,
          ownerName: r.owner_name,
          ownerEmail: r.owner_email || undefined,
          description: r.description || undefined,
          isActive: !!r.is_active,
          distance: Math.round(dist * 10) / 10,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      })
      .filter((p) => p.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return NextResponse.json({ success: true, data: producers });
  } catch (error) {
    console.error('GET /api/oil-producers error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  const ip = getRateLimitKey(request);
  const limit = rateLimit(`oil-producers-post:${ip}`, 3, 60000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'ลงทะเบียนบ่อยเกินไป กรุณารอสักครู่' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      shopName, shopCategory, oilType, oilTypeCustom, price, priceUnit,
      latitude, longitude, phone, logoUrl,
      ownerName, ownerEmail, description,
    } = body;

    const category = shopCategory && VALID_SHOP_CATEGORIES.includes(shopCategory) ? shopCategory : 'fuel';

    // Validation
    if (!shopName || !oilType || !price || !latitude || !longitude || !phone || !ownerName) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบ (ชื่อร้าน, ชนิดน้ำมัน, ราคา, เบอร์โทร, ชื่อเจ้าของ)' },
        { status: 400 }
      );
    }

    if (!VALID_OIL_TYPES.includes(oilType)) {
      return NextResponse.json(
        { success: false, error: 'ชนิดน้ำมันไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (typeof shopName === 'string' && shopName.length > 255) {
      return NextResponse.json({ success: false, error: 'ชื่อร้านยาวเกินไป' }, { status: 400 });
    }

    if (typeof phone === 'string' && phone.length > 50) {
      return NextResponse.json({ success: false, error: 'เบอร์โทรยาวเกินไป' }, { status: 400 });
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ success: false, error: 'ราคาไม่ถูกต้อง' }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO oil_producers (shop_name, shop_category, oil_type, oil_type_custom, price, price_unit, latitude, longitude, phone, logo_url, owner_name, owner_email, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shopName, category, oilType, oilTypeCustom || null, numPrice, priceUnit || 'บาท/ลิตร',
        latitude, longitude, phone, logoUrl || null,
        ownerName, ownerEmail || null, description || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ! ร้านของคุณจะปรากฏบนแผนที่ให้เพื่อนๆ เห็นค่ะ',
      id: result.insertId,
    });
  } catch (error) {
    console.error('POST /api/oil-producers error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}
