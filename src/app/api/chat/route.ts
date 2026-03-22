import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages required' },
        { status: 400 }
      );
    }

    const reply = await chat(messages);
    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return NextResponse.json(
      { success: false, error: 'AI service unavailable' },
      { status: 500 }
    );
  }
}
