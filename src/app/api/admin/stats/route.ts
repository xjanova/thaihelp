import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { query } from '@/lib/db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeQuery = async (sql: string): Promise<any[]> => {
  try {
    return await query(sql);
  } catch {
    return [];
  }
};

const safeCount = async (sql: string): Promise<number> => {
  const rows = await safeQuery(sql);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows[0] as any)?.cnt ?? 0;
};

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

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if tables exist first
    const tables = await safeQuery('SHOW TABLES');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableNames = tables.map((t: any) => Object.values(t)[0] as string);

    const hasIncidents = tableNames.includes('incidents');
    const hasStationReports = tableNames.includes('station_reports');
    const hasUsers = tableNames.includes('users');

    const totalStations = hasStationReports ? await safeCount('SELECT COUNT(DISTINCT place_id) as cnt FROM station_reports') : 0;
    const totalIncidents = hasIncidents ? await safeCount('SELECT COUNT(*) as cnt FROM incidents') : 0;
    const activeIncidents = hasIncidents ? await safeCount('SELECT COUNT(*) as cnt FROM incidents WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())') : 0;
    const totalReports = hasStationReports ? await safeCount('SELECT COUNT(*) as cnt FROM station_reports') : 0;
    const totalUsers = hasUsers ? await safeCount('SELECT COUNT(*) as cnt FROM users') : 0;

    // Recent station reports
    let recentReports: Record<string, unknown>[] = [];
    if (hasStationReports) {
      const rows = await safeQuery(`
        SELECT sr.id, sr.station_name as station, sr.reporter_name as reporter, sr.created_at,
          (SELECT COUNT(*) FROM fuel_reports fr WHERE fr.report_id = sr.id) as fuels
        FROM station_reports sr ORDER BY sr.created_at DESC LIMIT 5
      `);
      recentReports = rows.map((r: Record<string, unknown>) => ({
        id: r.id, station: r.station, reporter: r.reporter,
        time: timeAgo(r.created_at as string), fuels: r.fuels || 0,
      }));
    }

    // Recent incidents
    let recentIncidents: Record<string, unknown>[] = [];
    if (hasIncidents) {
      const rows = await safeQuery(`
        SELECT id, title, category, 'user' as reporter, created_at, upvotes
        FROM incidents ORDER BY created_at DESC LIMIT 5
      `);
      recentIncidents = rows.map((i: Record<string, unknown>) => ({
        id: i.id, title: i.title, category: i.category, reporter: i.reporter,
        time: timeAgo(i.created_at as string), upvotes: i.upvotes || 0,
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        totalStations, totalIncidents, totalReports, totalUsers, activeIncidents,
        recentReports, recentIncidents,
        dbReady: hasIncidents && hasStationReports && hasUsers,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        totalStations: 0, totalIncidents: 0, totalReports: 0,
        totalUsers: 0, activeIncidents: 0,
        recentReports: [], recentIncidents: [],
        dbReady: false,
      },
    }, { status: 500 });
  }
}
