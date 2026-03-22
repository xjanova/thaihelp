import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
): Promise<string> {
  const systemPrompt = {
    role: 'system' as const,
    content: `คุณคือ ThaiHelp AI ผู้ช่วยสำหรับคนไทยที่เดินทาง
คุณช่วยเรื่อง:
- แจ้งเหตุการณ์บนถนน (อุบัติเหตุ, น้ำท่วม, ถนนปิด)
- รายงานสถานะปั๊มน้ำมัน
- ให้ข้อมูลการเดินทาง
- สรุปสถานการณ์ในพื้นที่
ตอบเป็นภาษาไทยเสมอ กระชับ ได้ใจความ`,
  };

  const completion = await groq.chat.completions.create({
    messages: [systemPrompt, ...messages],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || 'ขออภัย ไม่สามารถตอบได้ในขณะนี้';
}

export { groq };
