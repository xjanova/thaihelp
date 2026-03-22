import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { query, execute } from '@/lib/db';

// GET — load all settings
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if table exists first
    const tables = await query('SHOW TABLES');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableNames = tables.map((t: any) => Object.values(t)[0] as string);
    if (!tableNames.includes('site_settings')) {
      return NextResponse.json({ success: true, data: {}, dbMissing: true });
    }

    const rows = await query('SELECT setting_key, setting_value, setting_group FROM site_settings ORDER BY setting_group, setting_key');
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.setting_key] = r.setting_value;
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: true, data: {}, error: String(error) });
  }
}

// PUT — update settings
export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid settings data' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await execute(
        `INSERT INTO site_settings (setting_key, setting_value, setting_group)
         VALUES (?, ?, 'general')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)]
      );
    }

    return NextResponse.json({ success: true, message: 'Settings saved' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
