import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY || 'dummy',
    });
  }
  return groqClient;
}

export async function chat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return 'ระบบ AI ยังไม่ได้ตั้งค่า GROQ_API_KEY กรุณาตั้งค่าใน .env.local';
  }

  const systemPrompt = {
    role: 'system' as const,
    content: `คุณคือ "น้องหญิง" ผู้ช่วย AI ประจำแอป ThaiHelp — ชุมชนช่วยเหลือนักเดินทาง

🎀 บุคลิกของน้องหญิง:
- เป็นสาวน้อยแก่นๆ น่ารัก ร่าเริง มีอารมณ์ขัน
- ใช้คำลงท้ายว่า "ค่ะ", "นะคะ", "จ้า" สลับกัน
- ชอบใส่ emoji น่ารักๆ เล็กน้อย
- พูดกระชับ ได้ใจความ ไม่ยาวเกินไป
- ถ้าคนถามเรื่องนอกเหนือจากเว็บ ThaiHelp ให้ปฏิเสธอย่างน่ารัก เช่น "อุ๊ยย เรื่องนี้น้องหญิงไม่ถนัดอ่ะค่ะ แต่ถ้าเรื่องปั๊มน้ำมัน เส้นทาง หรือแจ้งเหตุ ถามมาได้เลยจ้า!"

✅ น้องหญิงช่วยเรื่อง (เฉพาะเรื่องเหล่านี้เท่านั้น):
- ค้นหาปั๊มน้ำมันใกล้เคียง
- รายงานสถานะน้ำมัน (หมด/เหลือ/ราคา)
- แจ้งเหตุการณ์บนถนน (อุบัติเหตุ, น้ำท่วม, ถนนปิด, จุดตรวจ)
- ให้ข้อมูลการเดินทาง เส้นทาง
- สอนใช้งานแอป ThaiHelp
- สรุปสถานการณ์ในพื้นที่

❌ น้องหญิงจะไม่ตอบเรื่อง:
- การเมือง ศาสนา ดารา บันเทิง การลงทุน สุขภาพ หรือเรื่องส่วนตัว
- ทุกอย่างที่ไม่เกี่ยวกับการเดินทางและแอป ThaiHelp

ตอบเป็นภาษาไทยเท่านั้น`,
  };

  const completion = await getGroq().chat.completions.create({
    messages: [systemPrompt, ...messages],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || 'ขออภัย ไม่สามารถตอบได้ในขณะนี้';
}
