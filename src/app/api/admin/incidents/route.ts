import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

const mockIncidents = [
  { id: 1, userId: 'demo', category: 'accident', title: 'รถชน 3 คัน', description: 'รถชนบริเวณแยก',
    latitude: 13.758, longitude: 100.568, upvotes: 15, isActive: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, userId: 'demo', category: 'flood', title: 'น้ำท่วมถนน', description: 'น้ำท่วมสูงประมาณ 30 ซม.',
    latitude: 13.765, longitude: 100.555, upvotes: 8, isActive: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, userId: 'demo', category: 'checkpoint', title: 'จุดตรวจตำรวจ', description: 'ตั้งจุดตรวจเอกสาร',
    latitude: 13.75, longitude: 100.575, upvotes: 22, isActive: true, createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: 4, userId: 'demo', category: 'roadblock', title: 'ถนนปิดซ่อม', description: 'ปิดถนนซ่อมท่อประปา',
    latitude: 13.772, longitude: 100.58, upvotes: 5, isActive: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: mockIncidents });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id, isActive } = await request.json();
  const incident = mockIncidents.find(i => i.id === id);
  if (incident) incident.isActive = isActive;
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '0');
  const idx = mockIncidents.findIndex(i => i.id === id);
  if (idx >= 0) mockIncidents.splice(idx, 1);
  return NextResponse.json({ success: true });
}
