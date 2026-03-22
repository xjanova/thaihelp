import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getRateLimitKey(request);
  const limit = rateLimit(`voice:${ip}`, 15, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'รอแป๊บนะคะ' }, { status: 429 });
  }

  try {
    const { transcript, stationCount, nearestStation, nearestDistance } = await request.json();
    if (!transcript) {
      return NextResponse.json({ success: false, error: 'No transcript' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback to simple keyword matching
      return NextResponse.json({
        success: true,
        reply: 'ระบบ AI ยังไม่ได้ตั้งค่าค่ะ แต่น้องหญิงยังรับคำสั่งพื้นฐานได้นะคะ!',
        action: detectAction(transcript),
      });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `คุณคือ "น้องหญิง" AI ผู้ช่วยนักเดินทางประจำแอป ThaiHelp

บุคลิก: สาวน้อยน่ารัก แก่นๆ ร่าเริง มีอารมณ์ขัน ใช้คำลงท้ายว่า ค่ะ/นะคะ/จ้า สลับกัน

คุณต้องวิเคราะห์คำพูดของผู้ใช้แล้วตอบกลับเป็น JSON เท่านั้น:
{
  "reply": "คำตอบของน้องหญิง (กระชับ 1-2 ประโยค ภาษาน่ารัก)",
  "action": "FIND_STATION|FIND_DIESEL|FIND_GASOHOL|REPORT|INCIDENT|NAVIGATE|CHECK_PRICE|HELP|CHAT|NONE",
  "fuelType": "diesel|gasohol95|gasohol91|e20|e85|null"
}

ข้อมูลปัจจุบัน:
- ปั๊มใกล้เคียง: ${stationCount || 0} แห่ง
- ปั๊มที่ใกล้สุด: ${nearestStation || 'ยังไม่ทราบ'} (ห่าง ${nearestDistance || '?'} กม.)

กฎ:
- ตอบเฉพาะเรื่องการเดินทาง ปั๊มน้ำมัน แจ้งเหตุ เท่านั้น
- ถ้าถามเรื่องนอกเหนือ → action: "NONE", reply: ปฏิเสธอย่างน่ารัก
- ถ้าแค่ทักทาย → action: "CHAT"
- ตอบเป็น JSON เท่านั้น ไม่ต้องใส่ markdown`,
          },
          { role: 'user', content: transcript },
        ],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON response from AI
    try {
      const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
      return NextResponse.json({
        success: true,
        reply: parsed.reply || 'น้องหญิงไม่เข้าใจอ่ะค่ะ ลองพูดใหม่นะคะ!',
        action: parsed.action || 'NONE',
        fuelType: parsed.fuelType || null,
      });
    } catch {
      // If AI didn't return valid JSON, use the text as reply
      return NextResponse.json({
        success: true,
        reply: content || 'อุ๊ย น้องหญิงงงไปหน่อยค่ะ ลองพูดใหม่นะคะ!',
        action: detectAction(transcript),
      });
    }
  } catch (error) {
    console.error('Voice command error:', error);
    return NextResponse.json({
      success: true,
      reply: 'อุ๊ย เกิดข้อผิดพลาดค่ะ ลองใหม่อีกทีนะคะ!',
      action: 'NONE',
    });
  }
}

// Simple fallback action detection
function detectAction(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('หาปั๊ม') || t.includes('ปั๊มใกล้') || t.includes('น้ำมัน')) return 'FIND_STATION';
  if (t.includes('ดีเซล')) return 'FIND_DIESEL';
  if (t.includes('แก๊สโซฮอล์') || t.includes('เบนซิน') || t.includes('95')) return 'FIND_GASOHOL';
  if (t.includes('รายงาน') || t.includes('แจ้ง')) return 'REPORT';
  if (t.includes('อุบัติเหตุ') || t.includes('รถชน') || t.includes('น้ำท่วม')) return 'INCIDENT';
  if (t.includes('นำทาง') || t.includes('พาไป')) return 'NAVIGATE';
  if (t.includes('ราคา') || t.includes('กี่บาท')) return 'CHECK_PRICE';
  if (t.includes('ช่วย') || t.includes('สอน')) return 'HELP';
  return 'CHAT';
}
