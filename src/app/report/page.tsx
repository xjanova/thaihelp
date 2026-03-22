'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Send, Mic, MicOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSpeech } from '@/hooks/useSpeech';
import type { IncidentCategory } from '@/types';

const categories: { value: IncidentCategory; label: string; emoji: string }[] = [
  { value: 'accident', label: 'อุบัติเหตุ', emoji: '🚗' },
  { value: 'flood', label: 'น้ำท่วม', emoji: '🌊' },
  { value: 'roadblock', label: 'ถนนปิด', emoji: '🚧' },
  { value: 'checkpoint', label: 'จุดตรวจ', emoji: '👮' },
  { value: 'construction', label: 'ก่อสร้าง', emoji: '🏗️' },
  { value: 'other', label: 'อื่นๆ', emoji: '⚠️' },
];

export default function ReportPage() {
  const { user } = useAuth();
  const { position } = useGeolocation();
  const router = useRouter();
  const { isListening, transcript, listen, stopListening } = useSpeech();
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Voice fills title/description
  const handleVoice = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        if (!title) setTitle(transcript);
        else setDescription((prev) => (prev ? prev + ' ' : '') + transcript);
      }
    } else {
      listen();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title, description, latitude: position.lat, longitude: position.lng }),
      });
      if (res.ok) router.push('/');
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(145deg, #060a12, #0a1020)' }}>
        <div className="metal-panel rounded-2xl p-8 text-center max-w-sm">
          <p className="text-slate-300 mb-4">กรุณาเข้าสู่ระบบเพื่อแจ้งเหตุ</p>
          <Link href="/login" className="metal-btn-accent px-6 py-2.5 rounded-xl text-white font-medium inline-block">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #060a14, #0a1020)' }}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 chrome-bar">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/" className="metal-btn p-2 rounded-lg text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-chrome">แจ้งเหตุการณ์</h1>

          {/* Voice button in header */}
          <button
            onClick={handleVoice}
            className={`ml-auto p-2 rounded-lg transition-all ${
              isListening ? 'metal-btn-accent glow-red animate-pulse' : 'metal-btn text-slate-400 hover:text-orange-400'
            }`}
            title={isListening ? 'หยุดฟัง' : 'พูดเพื่อแจ้งเหตุ'}
          >
            {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      </div>

      {/* Voice transcript */}
      {isListening && (
        <div className="fixed top-16 left-4 right-4 z-40 metal-panel rounded-xl p-3 border-orange-500/15 animate-in slide-in-from-top-2">
          <p className="text-xs text-red-400 animate-pulse mb-1">● กำลังฟัง...</p>
          <p className="text-sm text-chrome">{transcript || 'พูดรายละเอียดเหตุการณ์ได้เลย...'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pt-20 pb-8 px-4 max-w-lg mx-auto space-y-6">
        {/* Category */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-3 block">ประเภทเหตุการณ์</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`metal-panel metal-panel-hover flex flex-col items-center gap-1.5 p-3.5 rounded-xl transition-all ${
                  category === cat.value
                    ? 'border-orange-500/40 glow-orange'
                    : ''
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-xs font-medium ${category === cat.value ? 'text-orange-400' : 'text-slate-400'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">หัวข้อ</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น รถชนหน้าเซ็นทรัล"
            className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">รายละเอียด <span className="text-slate-600">(ไม่บังคับ)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="รายละเอียดเพิ่มเติม..."
            rows={3}
            className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none resize-none"
          />
        </div>

        {/* Location */}
        <div className="metal-panel rounded-xl px-4 py-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500 shrink-0 drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]" />
          <span className="text-sm text-slate-400">
            ตำแหน่ง: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!category || !title || submitting}
          className="w-full flex items-center justify-center gap-2 metal-btn-accent disabled:opacity-40 disabled:shadow-none text-white font-semibold py-3.5 rounded-xl"
        >
          <Send className="w-5 h-5" />
          {submitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}
        </button>
      </form>
    </div>
  );
}
