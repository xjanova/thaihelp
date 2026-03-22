import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyStations, detectBrand, calculateDistance } from '@/lib/places';
import type { GasStation, StationReport } from '@/types';

// In-memory store for reports (replace with DB later)
const reportsStore: StationReport[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '13.7563');
    const lng = parseFloat(searchParams.get('lng') || '100.5018');
    // Clamp radius between 500 m and 50 km to prevent abuse
    const radius = Math.min(Math.max(parseInt(searchParams.get('radius') || '') || 10000, 500), 50000);

    // Fetch from Google Places
    const places = await searchNearbyStations(lat, lng, radius);

    // Map to our format + merge with community reports
    const stations: GasStation[] = places.map((place) => {
      const placeReports = reportsStore
        .filter((r) => r.placeId === place.place_id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const latestReport = placeReports[0];

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
        fuelReports: latestReport?.fuelReports || [],
        totalReports: placeReports.length,
        lastReportAt: latestReport?.createdAt || undefined,
      };
    });

    // Sort by distance
    stations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return NextResponse.json({ success: true, data: stations });
  } catch (error) {
    console.error('GET /api/stations error:', error);

    // Return mock data if Google API fails
    return NextResponse.json({
      success: true,
      data: getMockStations(),
      mock: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: StationReport = await request.json();
    const { placeId, stationName, reporterName, fuelReports, note, latitude, longitude, reporterEmail } = body;

    if (!placeId || !stationName || !reporterName || !fuelReports?.length) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบ' },
        { status: 400 }
      );
    }

    // Input length validation
    if (typeof stationName === 'string' && stationName.length > 255) {
      return NextResponse.json({ success: false, error: 'stationName ยาวเกินไป (สูงสุด 255 ตัวอักษร)' }, { status: 400 });
    }
    if (typeof reporterName === 'string' && reporterName.length > 100) {
      return NextResponse.json({ success: false, error: 'reporterName ยาวเกินไป (สูงสุด 100 ตัวอักษร)' }, { status: 400 });
    }
    if (note && typeof note === 'string' && note.length > 500) {
      return NextResponse.json({ success: false, error: 'note ยาวเกินไป (สูงสุด 500 ตัวอักษร)' }, { status: 400 });
    }
    if (Array.isArray(fuelReports) && fuelReports.length > 15) {
      return NextResponse.json({ success: false, error: 'fuelReports มีรายการมากเกินไป (สูงสุด 15 รายการ)' }, { status: 400 });
    }

    const report: StationReport = {
      id: Date.now(),
      placeId,
      stationName,
      reporterName,
      reporterEmail: reporterEmail || undefined,
      fuelReports,
      note: note || '',
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
    };

    reportsStore.push(report);

    // Keep only last 500 reports in memory
    if (reportsStore.length > 500) {
      reportsStore.splice(0, reportsStore.length - 500);
    }

    return NextResponse.json({
      success: true,
      message: 'ขอบคุณที่รายงาน! ข้อมูลจะแสดงให้เพื่อนร่วมทางทราบ',
      report,
    });
  } catch (error) {
    console.error('POST /api/stations error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}

function getMockStations(): GasStation[] {
  return [
    {
      place_id: 'mock_1',
      name: 'PTT สาขาพระราม 9',
      vicinity: 'ถนนพระราม 9 แขวงห้วยขวาง',
      latitude: 13.7570,
      longitude: 100.5670,
      rating: 4.2,
      user_ratings_total: 156,
      opening_hours: { open_now: true },
      distance: 0.5,
      brand: 'PTT',
      fuelReports: [
        { fuelType: 'gasohol95', status: 'available', price: 36.44 },
        { fuelType: 'gasohol91', status: 'available', price: 29.18 },
        { fuelType: 'diesel', status: 'low', price: 29.94 },
        { fuelType: 'e20', status: 'available', price: 33.14 },
      ],
      totalReports: 12,
      lastReportAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      place_id: 'mock_2',
      name: 'Shell ลาดพร้าว 71',
      vicinity: 'ถนนลาดพร้าว แขวงสะพานสอง',
      latitude: 13.7890,
      longitude: 100.5890,
      rating: 4.0,
      user_ratings_total: 89,
      opening_hours: { open_now: true },
      distance: 2.3,
      brand: 'Shell',
      fuelReports: [
        { fuelType: 'gasohol95', status: 'empty' },
        { fuelType: 'diesel', status: 'available', price: 29.94 },
        { fuelType: 'premium_diesel', status: 'available', price: 36.36 },
      ],
      totalReports: 8,
      lastReportAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      place_id: 'mock_3',
      name: 'Bangchak สุขุมวิท 101',
      vicinity: 'ถนนสุขุมวิท แขวงบางนา',
      latitude: 13.6620,
      longitude: 100.6120,
      rating: 3.8,
      user_ratings_total: 45,
      opening_hours: { open_now: false },
      distance: 5.1,
      brand: 'Bangchak',
      fuelReports: [],
      totalReports: 0,
    },
    {
      place_id: 'mock_4',
      name: 'Esso รัชดาภิเษก',
      vicinity: 'ถนนรัชดาภิเษก แขวงดินแดง',
      latitude: 13.7700,
      longitude: 100.5740,
      rating: 4.5,
      user_ratings_total: 210,
      opening_hours: { open_now: true },
      distance: 1.8,
      brand: 'Esso',
      fuelReports: [
        { fuelType: 'gasohol95', status: 'available', price: 36.44 },
        { fuelType: 'gasohol91', status: 'available', price: 29.18 },
        { fuelType: 'diesel', status: 'available', price: 29.94 },
        { fuelType: 'e20', status: 'empty' },
        { fuelType: 'e85', status: 'empty' },
      ],
      totalReports: 5,
      lastReportAt: new Date(Date.now() - 900000).toISOString(),
    },
  ];
}
