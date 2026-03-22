import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { query, execute } from '@/lib/db';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const incidents = await query(`
      SELECT id, user_id as userId, category, title, description,
        latitude, longitude, image_url as imageUrl,
        upvotes, is_active as isActive, created_at as createdAt, expires_at as expiresAt
      FROM incidents
      ORDER BY created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({ success: true, data: incidents });
  } catch (error) {
    console.error('Admin incidents GET error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isActive } = await request.json();
    if (id) {
      await execute('UPDATE incidents SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin incidents PUT error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
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
      // incident_votes will cascade delete
      await execute('DELETE FROM incidents WHERE id = ?', [id]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin incidents DELETE error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
