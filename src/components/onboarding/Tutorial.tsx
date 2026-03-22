'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Mic, Fuel, AlertTriangle, Navigation, Volume2, MapPin } from 'lucide-react';
import Image from 'next/image';
import { speak } from '@/lib/speech';

const TUTORIAL_KEY = 'thaihelp_tutorial_done';

const steps = [
  {
    title: 'ยินดีต้อนรับสู่ ThaiHelp!',
    desc: 'ชุมชนช่วยเหลือนักเดินทาง ใช้ง่ายๆ แม้ขณะขับรถ',
    icon: '🛡️',
    voice: 'ยินดีต้อนรับสู่ ThaiHelp ชุมชนช่วยเหลือนักเดินทาง',
    color: 'blue',
  },
  {
    title: 'สั่งด้วยเสียง',
    desc: 'กดปุ่มไมค์ แล้วพูดเช่น "หาปั๊ม", "รายงาน", "แจ้งเหตุ", "นำทาง"',
    icon: '🎤',
    voice: 'กดปุ่มไมค์ แล้วพูดคำสั่งได้เลย เช่น หาปั๊ม หรือ นำทาง',
    color: 'orange',
  },
  {
    title: 'ค้นหาปั๊มน้ำมัน',
    desc: 'ดูปั๊มใกล้เคียง ปรับรัศมี 1-100 กม. กรองตามชนิดน้ำมัน',
    icon: '⛽',
    voice: 'ค้นหาปั๊มน้ำมันใกล้คุณ ปรับรัศมีได้ และกรองตามชนิดน้ำมัน',
    color: 'emerald',
  },
  {
    title: 'รายงานช่วยเพื่อน',
    desc: 'รายงานว่าปั๊มไหนมีน้ำมันอะไร ราคาเท่าไหร่ หมดหรือเหลือ',
    icon: '📝',
    voice: 'รายงานสถานะน้ำมัน เพื่อช่วยเพื่อนร่วมทาง',
    color: 'yellow',
  },
  {
    title: 'นำทางทันที',
    desc: 'กด "นำทาง" เพื่อเปิด Google Maps พาไปปั๊มที่เลือก',
    icon: '🗺️',
    voice: 'กดปุ่มนำทาง เพื่อเปิด Google Maps พาไปปั๊มที่เลือก',
    color: 'blue',
  },
  {
    title: 'พร้อมใช้งาน!',
    desc: 'เริ่มใช้งานได้เลย กดปุ่มไมค์สีส้มด้านล่างเพื่อสั่งด้วยเสียง',
    icon: '🚀',
    voice: 'พร้อมใช้งานแล้ว กดปุ่มไมค์สีส้มเพื่อเริ่มสั่งด้วยเสียง',
    color: 'orange',
  },
];

export function Tutorial() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TUTORIAL_KEY);
    if (!done) {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setShow(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      const next = step + 1;
      setStep(next);
      speak(steps[next].voice);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      speak(steps[step - 1].voice);
    }
  };

  const handleSpeak = () => {
    speak(steps[step].voice);
  };

  if (!show) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="metal-panel rounded-3xl p-6 max-w-sm w-full relative overflow-hidden">
        {/* Progress */}
        <div className="flex gap-1 mb-5">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
              i <= step ? 'bg-orange-500' : 'bg-slate-700'
            }`} />
          ))}
        </div>

        {/* Close */}
        <button onClick={handleClose} className="absolute top-4 right-4 p-1 text-slate-600 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{current.icon}</div>
          <h2 className="text-lg font-bold text-chrome">{current.title}</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{current.desc}</p>

          {/* Speak button */}
          <button onClick={handleSpeak}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <Volume2 className="w-3.5 h-3.5" />
            ฟังเสียงอธิบาย
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={handlePrev} disabled={step === 0}
            className="metal-btn px-4 py-2.5 rounded-xl text-sm text-slate-400 disabled:opacity-30 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            ก่อนหน้า
          </button>

          <span className="text-xs text-slate-600">{step + 1} / {steps.length}</span>

          <button onClick={handleNext}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1 ${
              isLast ? 'metal-btn-accent text-white' : 'metal-btn-blue text-white'
            }`}>
            {isLast ? 'เริ่มใช้งาน' : 'ถัดไป'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skip */}
        <button onClick={handleClose} className="w-full text-center text-[10px] text-slate-600 hover:text-slate-400 mt-3">
          ข้าม — ฉันรู้วิธีใช้แล้ว
        </button>
      </div>
    </div>
  );
}
