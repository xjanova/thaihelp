import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import type { Incident, CreateIncidentInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '13.7563');
    const lng = parseFloat(searchParams.get('lng') || '100.5018');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km

    const incidents = await query<Incident>(
      `SELECT * FROM incidents
       WHERE isActive = 1
       AND expiresAt > GETDATE()
       ORDER BY createdAt DESC`
    );

    return NextResponse.json({ success: true, data: incidents });
  } catch (error) {
    console.error('GET /api/incidents error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateIncidentInput = await request.json();
    const { category, title, description, latitude, longitude, imageUrl } = body;

    if (!category || !title || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await execute(
      `INSERT INTO incidents (userId, category, title, description, latitude, longitude, imageUrl, upvotes, isActive, createdAt, expiresAt)
       VALUES (@userId, @category, @title, @description, @latitude, @longitude, @imageUrl, 0, 1, GETDATE(), DATEADD(HOUR, 4, GETDATE()))`,
      {
        userId: 'anonymous', // TODO: get from auth
        category,
        title,
        description: description || '',
        latitude,
        longitude,
        imageUrl: imageUrl || null,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/incidents error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
