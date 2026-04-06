'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Send, Mic, MicOff, Phone, Store, Fuel, ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSpeech } from '@/hooks/useSpeech';
import { OIL_TYPES, type OilType } from '@/types';

const PRICE_UNITS = ['บาท/ลิตร', 'บาท/กก.', 'บาท/ถัง', 'บาท/ขวด', 'บาท/แกลลอน'];

export default function RegisterOilPage() {
  const { user } = useAuth();
  const { position } = useGeolocation();
  const router = useRouter();
  const { isListening, transcript, listen, stopListening } = useSpeech();

  const [shopName, setShopName] = useState('');
  const [oilType, setOilType] = useState<OilType | null>(null);
  const [oilTypeCustom, setOilTypeCustom] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('บาท/ลิตร');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleVoice = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        if (!shopName) setShopName(transcript);
        else setDescription((prev) => (prev ? prev + ' ' : '') + transcript);
      }
    } else {
      listen();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !oilType || !price || !phone) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/oil-producers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          shopCategory: 'fuel',
          oilType,
          oilTypeCustom: oilType === 'other' ? oilTypeCustom : undefined,
          price: parseFloat(price),
          priceUnit,
          latitude: position.lat,
          longitude: position.lng,
          phone,
          logoUrl: logoUrl || undefined,
          ownerName: user?.nickname || 'ไม่ระบุ',
          ownerEmail: user?.email || undefined,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(145deg, #060a12, #0a1020)' }}>
        <div className="metal-panel rounded-2xl p-8 text-center max-w-sm">
          <Fuel className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <p className="text-slate-300 mb-4">กรุณาเข้าสู่ระบบเพื่อลงทะเบียนร้านน้ำมัน</p>
          <Link href="/login" className="metal-btn-accent px-6 py-2.5 rounded-xl text-white font-medium inline-block">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(145deg, #060a12, #0a1020)' }}>
        <div className="metal-panel rounded-2xl p-8 text-center max-w-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-emerald-400 mb-2">ลงทะเบียนสำเร็จ!</h2>
          <p className="text-slate-400 text-sm">ร้านของคุณจะปรากฏบนแผนที่ให้เพื่อนๆ หาเจอค่ะ</p>
          <p className="text-slate-600 text-xs mt-3">กำลังกลับหน้าแผนที่...</p>
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
          <h1 className="text-lg font-bold text-chrome">ลงทะเบียนผู้ผลิตน้ำมัน</h1>
          <button
            onClick={handleVoice}
            className={`ml-auto p-2 rounded-lg transition-all ${
              isListening ? 'metal-btn-accent glow-red animate-pulse' : 'metal-btn text-slate-400 hover:text-orange-400'
            }`}
            title={isListening ? 'หยุดฟัง' : 'พูดเพื่อกรอกข้อมูล'}
          >
            {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      </div>

      {/* Voice transcript */}
      {isListening && (
        <div className="fixed top-16 left-4 right-4 z-40 metal-panel rounded-xl p-3 border-emerald-500/15 animate-in slide-in-from-top-2">
          <p className="text-xs text-emerald-400 animate-pulse mb-1">● กำลังฟัง...</p>
          <p className="text-sm text-chrome">{transcript || 'พูดข้อมูลร้านน้ำมันได้เลย...'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pt-20 pb-8 px-4 max-w-lg mx-auto space-y-6">
        {/* Info banner */}
        <div className="metal-panel rounded-xl p-3 border-orange-500/10">
          <div className="flex items-start gap-2">
            <Fuel className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              ลงทะเบียนเป็นผู้ผลิตน้ำมันเชื้อเพลิงแบบทำเอง เพื่อให้ปรากฏบนแผนที่ให้เพื่อนๆ หาเจอ น้องหญิงจะช่วยแนะนำร้านของคุณและราคาน้ำมันค่ะ
            </p>
          </div>
        </div>

        {/* Shop Name */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            ชื่อร้าน
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="เช่น ลุงสมชาย ไบโอดีเซล"
            className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none"
            maxLength={255}
            required
          />
        </div>

        {/* Oil Type */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5" />
            ชนิดน้ำมันเชื้อเพลิง
          </label>
          <div className="grid grid-cols-3 gap-2">
            {OIL_TYPES.map((oil) => (
              <button
                key={oil.key}
                type="button"
                onClick={() => setOilType(oil.key)}
                className={`metal-panel metal-panel-hover flex flex-col items-center gap-1.5 p-3.5 rounded-xl transition-all ${
                  oilType === oil.key ? 'border-orange-500/40 glow-orange' : ''
                }`}
              >
                <span className="text-2xl">{oil.emoji}</span>
                <span className={`text-xs font-medium text-center leading-tight ${oilType === oil.key ? 'text-orange-400' : 'text-slate-400'}`}>
                  {oil.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom oil type */}
        {oilType === 'other' && (
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">ระบุชนิดน้ำมันเชื้อเพลิง</label>
            <input
              type="text"
              value={oilTypeCustom}
              onChange={(e) => setOilTypeCustom(e.target.value)}
              placeholder="เช่น น้ำมันยาง, น้ำมันเมล็ดสบู่ดำ"
              className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none"
              maxLength={255}
            />
          </div>
        )}

        {/* Price + Unit */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">ราคา</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="เช่น 28.50"
              className="flex-1 metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none"
              min="0"
              step="0.01"
              required
            />
            <select
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
              className="metal-input rounded-xl px-3 py-3 text-white text-xs focus:outline-none"
            >
              {PRICE_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            เบอร์โทรติดต่อ
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="เช่น 081-234-5678"
            className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none"
            maxLength={50}
            required
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            URL โลโก้ร้าน <span className="text-slate-600">(ไม่บังคับ)</span>
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.jpg"
            className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            รายละเอียด <span className="text-slate-600">(ไม่บังคับ)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="เช่น เปิดทุกวัน 8:00-18:00 ผลิตจากน้ำมันพืชใช้แล้ว"
            rows={3}
            className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none resize-none"
          />
        </div>

        {/* Location */}
        <div className="metal-panel rounded-xl px-4 py-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500 shrink-0 drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
          <span className="text-sm text-slate-400">
            พิกัด: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="metal-panel rounded-xl px-4 py-3 border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!shopName || !oilType || !price || !phone || submitting}
          className="w-full flex items-center justify-center gap-2 metal-btn-accent disabled:opacity-40 disabled:shadow-none text-white font-semibold py-3.5 rounded-xl"
        >
          <Send className="w-5 h-5" />
          {submitting ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนร้าน'}
        </button>
      </form>
    </div>
  );
}
