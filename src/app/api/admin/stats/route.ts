import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { query } from '@/lib/db';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Query real counts from DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeCount = async (sql: string): Promise<number> => {
      try {
        const rows = await query(sql);
        return (rows[0] as any)?.cnt ?? 0;
      } catch { return 0; }
    };

    const totalStations = await safeCount('SELECT COUNT(DISTINCT place_id) as cnt FROM station_reports');
    const totalIncidents = await safeCount('SELECT COUNT(*) as cnt FROM incidents');
    const activeIncidents = await safeCount('SELECT COUNT(*) as cnt FROM incidents WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())');
    const totalReports = await safeCount('SELECT COUNT(*) as cnt FROM station_reports');
    const totalUsers = await safeCount('SELECT COUNT(*) as cnt FROM users');

    // Recent station reports
    const recentReports = await query(`
      SELECT sr.id, sr.station_name as station, sr.reporter_name as reporter,
        sr.created_at,
        (SELECT COUNT(*) FROM fuel_reports fr WHERE fr.report_id = sr.id) as fuels
      FROM station_reports sr
      ORDER BY sr.created_at DESC
      LIMIT 5
    `).catch(() => []);

    // Recent incidents
    const recentIncidents = await query(`
      SELECT id, title, category, 'user' as reporter, created_at, upvotes
      FROM incidents
      ORDER BY created_at DESC
      LIMIT 5
    `).catch(() => []);

    // Format time ago
    const timeAgo = (date: Date | string) => {
      const now = new Date();
      const d = new Date(date);
      const diffMs = now.getTime() - d.getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'เมื่อสักครู่';
      if (mins < 60) return `${mins} นาทีที่แล้ว`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
      const days = Math.floor(hours / 24);
      return `${days} วันที่แล้ว`;
    };

    const stats = {
      totalStations,
      totalIncidents,
      totalReports,
      totalUsers,
      activeIncidents,
      recentReports: recentReports.map((r: Record<string, unknown>) => ({
        id: r.id,
        station: r.station,
        reporter: r.reporter,
        time: timeAgo(r.created_at as string),
        fuels: r.fuels || 0,
      })),
      recentIncidents: recentIncidents.map((i: Record<string, unknown>) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        reporter: i.reporter,
        time: timeAgo(i.created_at as string),
        upvotes: i.upvotes || 0,
      })),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Stats query error:', error);
    // Fallback to zeros if DB fails
    return NextResponse.json({
      success: true,
      data: {
        totalStations: 0,
        totalIncidents: 0,
        totalReports: 0,
        totalUsers: 0,
        activeIncidents: 0,
        recentReports: [],
        recentIncidents: [],
      },
    });
  }
}
