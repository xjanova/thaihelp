import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Mock stats — replace with real DB queries
  const stats = {
    totalStations: 4,
    totalIncidents: 4,
    totalReports: 25,
    totalUsers: 12,
    activeIncidents: 3,
    recentReports: [
      { id: 1, station: 'PTT สาขาพระราม 9', reporter: 'สมชาย', time: '10 นาทีที่แล้ว', fuels: 4 },
      { id: 2, station: 'Shell ลาดพร้าว 71', reporter: 'มานี', time: '30 นาทีที่แล้ว', fuels: 3 },
      { id: 3, station: 'Esso รัชดาภิเษก', reporter: 'วิชัย', time: '1 ชั่วโมงที่แล้ว', fuels: 5 },
      { id: 4, station: 'Bangchak สุขุมวิท', reporter: 'พิมพ์', time: '2 ชั่วโมงที่แล้ว', fuels: 2 },
    ],
    recentIncidents: [
      { id: 1, title: 'รถชน 3 คัน', category: 'accident', reporter: 'demo', time: '30 นาทีที่แล้ว', upvotes: 15 },
      { id: 2, title: 'น้ำท่วมถนน', category: 'flood', reporter: 'demo', time: '1 ชั่วโมงที่แล้ว', upvotes: 8 },
      { id: 3, title: 'จุดตรวจตำรวจ', category: 'checkpoint', reporter: 'demo', time: '15 นาทีที่แล้ว', upvotes: 22 },
    ],
  };

  return NextResponse.json({ success: true, data: stats });
}
