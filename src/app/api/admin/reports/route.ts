import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { query, execute } from '@/lib/db';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reports = await query(`
      SELECT sr.id, sr.place_id as placeId, sr.station_name as stationName,
        sr.reporter_name as reporterName, sr.reporter_email as reporterEmail,
        sr.note, sr.latitude, sr.longitude, sr.created_at as createdAt
      FROM station_reports sr
      ORDER BY sr.created_at DESC
      LIMIT 50
    `);

    // Get fuel reports for each station report
    for (const report of reports) {
      const fuels = await query(
        'SELECT fuel_type as fuelType, status, price FROM fuel_reports WHERE report_id = ?',
        [report.id]
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (report as any).fuelReports = fuels;
    }

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('Admin reports GET error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    if (id > 0) {
      // fuel_reports will cascade delete
      await execute('DELETE FROM station_reports WHERE id = ?', [id]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin reports DELETE error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
