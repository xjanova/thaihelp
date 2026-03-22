import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyStations, detectBrand, calculateDistance } from '@/lib/places';
import { query, execute } from '@/lib/db';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import type { GasStation, FuelReport } from '@/types';

export async function GET(request: NextRequest) {
  const ip = getRateLimitKey(request);
  const limit = rateLimit(`stations-get:${ip}`, 20, 60000);
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
    const radius = Math.min(Math.max(parseInt(searchParams.get('radius') || '') || 10000, 500), 100000);

    // Fetch from Google Places
    const places = await searchNearbyStations(lat, lng, radius);

    // Get recent reports from MySQL (last 6 hours)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbReports: any[] = [];
    try {
      dbReports = await query(
        `SELECT sr.place_id, fr.fuel_type, fr.status, fr.price, sr.reporter_name, sr.created_at
         FROM station_reports sr
         JOIN fuel_reports fr ON fr.report_id = sr.id
         WHERE sr.created_at > DATE_SUB(NOW(), INTERVAL 6 HOUR)
         ORDER BY sr.created_at DESC`
      );
    } catch {
      // DB not ready yet — continue with empty reports
    }

    // Map to our format + merge with DB reports
    const stations: GasStation[] = places.map((place) => {
      const placeReports = dbReports.filter((r) => r.place_id === place.place_id);
      const fuelReports: FuelReport[] = [];
      const seenFuels = new Set<string>();

      // Use latest report per fuel type
      for (const r of placeReports) {
        if (!seenFuels.has(r.fuel_type)) {
          seenFuels.add(r.fuel_type);
          fuelReports.push({
            fuelType: r.fuel_type as FuelReport['fuelType'],
            status: r.status as FuelReport['status'],
            price: r.price || undefined,
          });
        }
      }

      return {
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        opening_hours: place.opening_hours,
        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        brand: detectBrand(place.name),
        fuelReports,
        totalReports: new Set(placeReports.map((r) => r.created_at)).size,
        lastReportAt: placeReports[0]?.created_at || undefined,
      };
    });

    stations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return NextResponse.json({ success: true, data: stations });
  } catch (error) {
    console.error('GET /api/stations error:', error);
    return NextResponse.json({ success: true, data: getMockStations(), mock: true });
  }
}

export async function POST(request: NextRequest) {
  const ip = getRateLimitKey(request);
  const limit = rateLimit(`stations-post:${ip}`, 5, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'รายงานบ่อยเกินไป กรุณารอสักครู่' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { placeId, stationName, reporterName, fuelReports, note, latitude, longitude, reporterEmail } = body;

    if (!placeId || !stationName || !reporterName || !fuelReports?.length) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }
    if (typeof stationName === 'string' && stationName.length > 255) {
      return NextResponse.json({ success: false, error: 'ชื่อปั๊มยาวเกินไป' }, { status: 400 });
    }
    if (Array.isArray(fuelReports) && fuelReports.length > 15) {
      return NextResponse.json({ success: false, error: 'fuelReports มากเกินไป' }, { status: 400 });
    }

    // Insert station report
    const result = await execute(
      `INSERT INTO station_reports (place_id, station_name, reporter_name, reporter_email, note, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [placeId, stationName, reporterName, reporterEmail || null, note || '', latitude || 0, longitude || 0]
    );

    const reportId = result.insertId;

    // Insert fuel reports
    for (const fuel of fuelReports) {
      await execute(
        `INSERT INTO fuel_reports (report_id, fuel_type, status, price) VALUES (?, ?, ?, ?)`,
        [reportId, fuel.fuelType, fuel.status, fuel.price || null]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ขอบคุณที่รายงาน! ข้อมูลจะแสดงให้เพื่อนร่วมทางทราบ',
      reportId,
    });
  } catch (error) {
    console.error('POST /api/stations error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}

function getMockStations(): GasStation[] {
  return [
    {
      place_id: 'mock_1', name: 'PTT สาขาพระราม 9', vicinity: 'ถนนพระราม 9',
      latitude: 13.757, longitude: 100.567, rating: 4.2, user_ratings_total: 156,
      opening_hours: { open_now: true }, distance: 0.5, brand: 'PTT',
      fuelReports: [
        { fuelType: 'gasohol95', status: 'available', price: 36.44 },
        { fuelType: 'diesel', status: 'low', price: 29.94 },
      ],
      totalReports: 12, lastReportAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      place_id: 'mock_2', name: 'Shell ลาดพร้าว', vicinity: 'ถนนลาดพร้าว',
      latitude: 13.789, longitude: 100.589, rating: 4.0, user_ratings_total: 89,
      opening_hours: { open_now: true }, distance: 2.3, brand: 'Shell',
      fuelReports: [{ fuelType: 'gasohol95', status: 'empty' }, { fuelType: 'diesel', status: 'available', price: 29.94 }],
      totalReports: 8, lastReportAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}
