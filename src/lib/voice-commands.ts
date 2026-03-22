'use client';

// Voice Command System — ใช้ในรถยนต์
// คำสั่งลัดสำหรับสั่งงานด้วยเสียงขณะขับรถ

export interface VoiceCommand {
  keywords: string[];
  action: string;
  description: string;
  example: string;
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    keywords: ['หาปั๊ม', 'ปั๊มใกล้', 'ปั๊มน้ำมัน', 'หาน้ำมัน', 'เติมน้ำมัน', 'ปั๊มไหน'],
    action: 'FIND_STATION',
    description: 'ค้นหาปั๊มน้ำมันใกล้เคียง',
    example: 'หาปั๊มน้ำมันใกล้ฉัน',
  },
  {
    keywords: ['หาดีเซล', 'ดีเซลที่ไหน', 'ปั๊มดีเซล', 'ดีเซลหมด'],
    action: 'FIND_DIESEL',
    description: 'ค้นหาปั๊มที่มีดีเซล',
    example: 'หาปั๊มที่มีดีเซล',
  },
  {
    keywords: ['หาแก๊สโซฮอล์', 'เบนซิน', '95', '91', 'แก๊สโซฮอล์'],
    action: 'FIND_GASOHOL',
    description: 'ค้นหาปั๊มที่มีแก๊สโซฮอล์',
    example: 'หาปั๊มแก๊สโซฮอล์ 95',
  },
  {
    keywords: ['รายงาน', 'แจ้ง', 'บอก', 'น้ำมันหมด', 'รายงานปั๊ม'],
    action: 'REPORT',
    description: 'รายงานสถานะน้ำมัน',
    example: 'รายงาน ดีเซลหมดที่ปั๊ม PTT',
  },
  {
    keywords: ['แจ้งเหตุ', 'อุบัติเหตุ', 'รถชน', 'น้ำท่วม', 'ถนนปิด', 'จุดตรวจ'],
    action: 'INCIDENT',
    description: 'แจ้งเหตุการณ์บนถนน',
    example: 'แจ้งเหตุ รถชนข้างหน้า',
  },
  {
    keywords: ['นำทาง', 'พาไป', 'ไปปั๊ม', 'เส้นทาง'],
    action: 'NAVIGATE',
    description: 'นำทางไปปั๊มที่ใกล้ที่สุด',
    example: 'นำทางไปปั๊มที่ใกล้ที่สุด',
  },
  {
    keywords: ['ราคา', 'ราคาน้ำมัน', 'กี่บาท', 'ราคาดีเซล', 'ราคาเบนซิน'],
    action: 'CHECK_PRICE',
    description: 'ตรวจสอบราคาน้ำมัน',
    example: 'ราคาดีเซลเท่าไหร่',
  },
  {
    keywords: ['ช่วย', 'สอน', 'ใช้ยังไง', 'ทำอะไรได้', 'คำสั่ง'],
    action: 'HELP',
    description: 'แสดงคำสั่งทั้งหมด',
    example: 'ช่วยบอกคำสั่งที่ใช้ได้',
  },
];

export function matchCommand(transcript: string): VoiceCommand | null {
  const lower = transcript.toLowerCase();
  for (const cmd of VOICE_COMMANDS) {
    if (cmd.keywords.some((kw) => lower.includes(kw))) {
      return cmd;
    }
  }
  return null;
}

// Generate voice response for each action
// น้องหญิง — AI Voice Personality
export function getVoiceResponse(action: string, data?: Record<string, unknown>): string {
  switch (action) {
    case 'FIND_STATION':
      return data?.count
        ? `เจอปั๊มน้ำมัน ${data.count} แห่งใกล้พี่เลยค่ะ! ปั๊มที่ใกล้สุดคือ ${data.nearest || 'ไม่ทราบ'} ห่างแค่ ${data.distance || '?'} กิโลเมตรจ้า`
        : 'รอแป๊บนะคะ น้องหญิงกำลังหาปั๊มน้ำมันใกล้พี่อยู่จ้า';
    case 'FIND_DIESEL':
      return 'โอเคค่ะ น้องหญิงกำลังหาปั๊มที่มีดีเซลให้นะคะ รอแป๊บจ้า';
    case 'FIND_GASOHOL':
      return 'ได้เลยค่ะ น้องหญิงหาปั๊มที่มีแก๊สโซฮอล์ให้เดี๋ยวนี้จ้า';
    case 'REPORT':
      return 'เปิดหน้ารายงานให้แล้วนะคะ พี่พูดรายละเอียดได้เลยจ้า น้องหญิงฟังอยู่!';
    case 'INCIDENT':
      return 'เปิดหน้าแจ้งเหตุให้แล้วค่ะ พี่บอกรายละเอียดมาได้เลยนะคะ น้องหญิงจะช่วยบันทึกให้!';
    case 'NAVIGATE':
      return data?.nearest
        ? `เปิดนำทางไป ${data.nearest} ให้แล้วนะคะ ขับดีๆ นะจ้า!`
        : 'น้องหญิงเปิด Google Maps ให้แล้วค่ะ เดินทางปลอดภัยนะคะ!';
    case 'CHECK_PRICE':
      return 'น้องหญิงกำลังเช็คราคาน้ำมันล่าสุดให้นะคะ รอแป๊บจ้า';
    case 'HELP':
      return 'พี่พูดคำสั่งง่ายๆ ได้เลยนะคะ เช่น หาปั๊ม, รายงาน, แจ้งเหตุ, นำทาง, หรือ ราคาน้ำมัน น้องหญิงช่วยได้หมดเลยจ้า!';
    default:
      return 'อุ๊ย ไม่เข้าใจอ่ะค่ะ ลองพูดว่า หาปั๊ม หรือ ช่วย ได้นะคะ น้องหญิงจะช่วยเอง!';
  }
}
