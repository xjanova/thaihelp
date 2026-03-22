'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Camera, Send } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
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
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title || !user) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          description,
          latitude: position.lat,
          longitude: position.lng,
        }),
      });

      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-300 mb-4">กรุณาเข้าสู่ระบบเพื่อแจ้งเหตุ</p>
          <Link href="/login" className="text-orange-400 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-white">แจ้งเหตุการณ์</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pt-18 pb-8 px-4 max-w-lg mx-auto space-y-6">
        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            ประเภทเหตุการณ์
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  category === cat.value
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            หัวข้อ
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น รถชนหน้าเซ็นทรัล"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            รายละเอียด (ไม่บังคับ)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="รายละเอียดเพิ่มเติม..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-slate-400 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
          <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
          <span className="text-sm">
            ตำแหน่ง: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!category || !title || submitting}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
          {submitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}
        </button>
      </form>
    </div>
  );
}
