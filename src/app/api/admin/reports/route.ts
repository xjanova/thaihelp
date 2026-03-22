import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Share the same in-memory store as the main stations API
// In production, this would use the database
const mockReports = [
  { id: 1, placeId: 'mock_1', stationName: 'PTT สาขาพระราม 9', reporterName: 'สมชาย', reporterEmail: 'somchai@example.com',
    fuelReports: [{ fuelType: 'gasohol95', status: 'available', price: 36.44 }, { fuelType: 'diesel', status: 'low', price: 29.94 }],
    note: 'คิวยาวมาก', latitude: 13.757, longitude: 100.567, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 2, placeId: 'mock_2', stationName: 'Shell ลาดพร้าว 71', reporterName: 'มานี', reporterEmail: '',
    fuelReports: [{ fuelType: 'gasohol95', status: 'empty' }, { fuelType: 'diesel', status: 'available', price: 29.94 }],
    note: '', latitude: 13.789, longitude: 100.589, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, placeId: 'mock_4', stationName: 'Esso รัชดาภิเษก', reporterName: 'วิชัย', reporterEmail: 'wichai@test.com',
    fuelReports: [{ fuelType: 'gasohol95', status: 'available', price: 36.44 }, { fuelType: 'e20', status: 'empty' }, { fuelType: 'e85', status: 'empty' }],
    note: 'E20 E85 หมดแล้ว', latitude: 13.77, longitude: 100.574, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, placeId: 'mock_1', stationName: 'PTT สาขาพระราม 9', reporterName: 'พิมพ์', reporterEmail: '',
    fuelReports: [{ fuelType: 'diesel', status: 'available', price: 29.94 }, { fuelType: 'gasohol91', status: 'available', price: 29.18 }],
    note: '', latitude: 13.757, longitude: 100.567, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: mockReports });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '0');
  const idx = mockReports.findIndex(r => r.id === id);
  if (idx >= 0) mockReports.splice(idx, 1);
  return NextResponse.json({ success: true });
}
