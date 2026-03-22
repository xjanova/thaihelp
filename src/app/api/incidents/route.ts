import { NextRequest, NextResponse } from 'next/server';
import type { Incident, CreateIncidentInput, IncidentCategory } from '@/types';

const VALID_CATEGORIES: IncidentCategory[] = ['accident', 'flood', 'roadblock', 'checkpoint', 'construction', 'other'];

// In-memory store (replace with DB later)
const incidentsStore: Incident[] = [
  {
    id: 1,
    userId: 'demo',
    category: 'accident',
    title: 'รถชน 3 คัน',
    description: 'รถชนบริเวณแยก ทำให้รถติดมาก',
    latitude: 13.7580,
    longitude: 100.5680,
    upvotes: 15,
    isActive: true,
    createdAt: new Date(Date.now() - 1800000),
    expiresAt: new Date(Date.now() + 7200000),
  },
  {
    id: 2,
    userId: 'demo',
    category: 'flood',
    title: 'น้ำท่วมถนน',
    description: 'น้ำท่วมสูงประมาณ 30 ซม.',
    latitude: 13.7650,
    longitude: 100.5550,
    upvotes: 8,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 7200000),
  },
  {
    id: 3,
    userId: 'demo',
    category: 'checkpoint',
    title: 'จุดตรวจตำรวจ',
    description: 'ตั้งจุดตรวจเอกสาร',
    latitude: 13.7500,
    longitude: 100.5750,
    upvotes: 22,
    isActive: true,
    createdAt: new Date(Date.now() - 900000),
    expiresAt: new Date(Date.now() + 10800000),
  },
  {
    id: 4,
    userId: 'demo',
    category: 'roadblock',
    title: 'ถนนปิดซ่อม',
    description: 'ปิดถนนซ่อมท่อประปา',
    latitude: 13.7720,
    longitude: 100.5800,
    upvotes: 5,
    isActive: true,
    createdAt: new Date(Date.now() - 5400000),
    expiresAt: new Date(Date.now() + 14400000),
  },
];

export async function GET() {
  try {
    const activeIncidents = incidentsStore.filter(
      (i) => i.isActive && new Date(i.expiresAt).getTime() > Date.now()
    );

    return NextResponse.json({ success: true, data: activeIncidents });
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

    // Input validation
    if (!VALID_CATEGORIES.includes(category as IncidentCategory)) {
      return NextResponse.json(
        { success: false, error: `category ไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }
    if (typeof title === 'string' && title.length > 200) {
      return NextResponse.json({ success: false, error: 'title ยาวเกินไป (สูงสุด 200 ตัวอักษร)' }, { status: 400 });
    }
    if (description && typeof description === 'string' && description.length > 1000) {
      return NextResponse.json({ success: false, error: 'description ยาวเกินไป (สูงสุด 1000 ตัวอักษร)' }, { status: 400 });
    }

    const newIncident: Incident = {
      id: Date.now(),
      userId: 'anonymous',
      category,
      title,
      description: description || '',
      latitude,
      longitude,
      imageUrl,
      upvotes: 0,
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 3600000), // 4 hours
    };

    incidentsStore.push(newIncident);

    // Keep store manageable
    if (incidentsStore.length > 200) {
      incidentsStore.splice(0, incidentsStore.length - 200);
    }

    return NextResponse.json({ success: true, data: newIncident });
  } catch (error) {
    console.error('POST /api/incidents error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
