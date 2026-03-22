'use client';

import { useState } from 'react';
import { X, Send, Mic, MicOff, CheckCircle2 } from 'lucide-react';
import { FUEL_TYPES, type GasStation, type FuelReport, type FuelStatus, type FuelType } from '@/types';
import { useSpeech } from '@/hooks/useSpeech';

interface ReportModalProps {
  station: GasStation;
  onClose: () => void;
  onSubmit: () => void;
}

const STATUS_OPTIONS: { value: FuelStatus; label: string; emoji: string; active: string }[] = [
  { value: 'available', label: 'มี', emoji: '✅', active: 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/20' },
  { value: 'low', label: 'น้อย', emoji: '⚠️', active: 'border-yellow-500 bg-yellow-500/15 text-yellow-400 shadow-yellow-500/20' },
  { value: 'empty', label: 'หมด', emoji: '❌', active: 'border-red-500 bg-red-500/15 text-red-400 shadow-red-500/20' },
];

export function ReportModal({ station, onClose, onSubmit }: ReportModalProps) {
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [fuelReports, setFuelReports] = useState<FuelReport[]>([]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { isListening, transcript, listen, stopListening, sayText } = useSpeech();

  const toggleFuel = (fuelType: FuelType, status: FuelStatus) => {
    setFuelReports((prev) => {
      const existing = prev.findIndex((f) => f.fuelType === fuelType);
      if (existing >= 0) {
        if (prev[existing].status === status) return prev.filter((_, i) => i !== existing);
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status };
        return updated;
      }
      return [...prev, { fuelType, status }];
    });
  };

  const updatePrice = (fuelType: FuelType, price: string) => {
    setFuelReports((prev) => {
      const idx = prev.findIndex((f) => f.fuelType === fuelType);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], price: price ? parseFloat(price) : undefined };
        return updated;
      }
      return prev;
    });
  };

  const handleVoiceReport = () => {
    if (isListening) {
      stopListening();
      if (transcript) parseVoice(transcript);
    } else {
      listen();
    }
  };

  const parseVoice = (text: string) => {
    const lower = text.toLowerCase();
    const newReports: FuelReport[] = [];
    for (const fuel of FUEL_TYPES) {
      if (lower.includes(fuel.label.toLowerCase()) || lower.includes(fuel.labelEn.toLowerCase())) {
        let status: FuelStatus = 'available';
        if (lower.includes('หมด') || lower.includes('ไม่มี')) status = 'empty';
        else if (lower.includes('น้อย') || lower.includes('เหลือน้อย')) status = 'low';
        const priceMatch = text.match(/(\d+\.?\d*)\s*(บาท|baht)/i);
        newReports.push({ fuelType: fuel.key, status, price: priceMatch ? parseFloat(priceMatch[1]) : undefined });
      }
    }
    if (newReports.length > 0) {
      setFuelReports((prev) => {
        const merged = [...prev];
        for (const nr of newReports) {
          const idx = merged.findIndex((f) => f.fuelType === nr.fuelType);
          if (idx >= 0) merged[idx] = nr; else merged.push(nr);
        }
        return merged;
      });
      sayText(`บันทึกข้อมูลน้ำมัน ${newReports.length} ประเภทแล้วค่ะ`);
    } else {
      setNote((prev) => (prev ? prev + ' ' : '') + text);
      sayText('เพิ่มบันทึกย่อเรียบร้อยค่ะ');
    }
  };

  const handleSubmit = async () => {
    if (!reporterName.trim() || fuelReports.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: station.place_id, stationName: station.name,
          reporterName: reporterName.trim(), reporterEmail: reporterEmail.trim() || undefined,
          fuelReports, note: note.trim(), latitude: station.latitude, longitude: station.longitude,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        sayText('ขอบคุณที่รายงานค่ะ');
        setTimeout(() => onSubmit(), 2000);
      }
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="metal-panel rounded-3xl p-8 max-w-sm w-full text-center border-emerald-500/20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 glow-cyan">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <h3 className="text-xl font-bold text-chrome mb-2">ขอบคุณครับ! 🙏</h3>
          <p className="text-slate-400 text-sm">ข้อมูลจะแสดงให้เพื่อนร่วมทางทราบทันที</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="metal-panel rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 glass rounded-t-3xl p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-chrome">รายงานสถานะน้ำมัน</h2>
            <p className="text-xs text-slate-500 mt-0.5">{station.name}</p>
          </div>
          <button onClick={onClose} className="metal-btn p-2 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="metal-divider" />

        <div className="p-4 space-y-5">
          {/* Voice */}
          <div className="metal-panel rounded-2xl p-4 border-orange-500/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-orange-400">🎤 รายงานด้วยเสียง</p>
                <p className="text-xs text-slate-500 mt-0.5">พูดว่า &quot;ดีเซลหมด แก๊สโซฮอล์ 95 มี 36 บาท&quot;</p>
              </div>
              <button
                onClick={handleVoiceReport}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'metal-btn-accent animate-pulse scale-110 glow-red'
                    : 'metal-btn-accent'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
            </div>
            {isListening && (
              <div className="metal-panel rounded-xl p-3 mt-2">
                <p className="text-xs text-red-400 animate-pulse mb-1">● กำลังฟัง...</p>
                <p className="text-sm text-chrome">{transcript || 'พูดได้เลยครับ...'}</p>
              </div>
            )}
          </div>

          {/* Reporter */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">ชื่อผู้รายงาน <span className="text-red-400">*</span></label>
              <input type="text" value={reporterName} onChange={(e) => setReporterName(e.target.value)}
                placeholder="ชื่อเล่น หรือชื่อจริง"
                className="w-full metal-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">อีเมล <span className="text-slate-600">(ไม่บังคับ)</span></label>
              <input type="email" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full metal-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none" />
            </div>
          </div>

          {/* Fuel Grid */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-3 block">
              สถานะน้ำมัน <span className="text-red-400">*</span>
              <span className="text-slate-600 font-normal ml-1">กดเลือกสถานะ</span>
            </label>
            <div className="space-y-2">
              {FUEL_TYPES.map((fuel) => {
                const report = fuelReports.find((r) => r.fuelType === fuel.key);
                return (
                  <div key={fuel.key} className="metal-panel rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: fuel.color, boxShadow: `0 0 6px ${fuel.color}40` }} />
                        <span className="text-sm text-chrome font-medium">{fuel.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {STATUS_OPTIONS.map((opt) => (
                          <button key={opt.value} type="button" onClick={() => toggleFuel(fuel.key, opt.value)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all shadow-sm ${
                              report?.status === opt.value ? opt.active : 'border-slate-700/50 text-slate-500 hover:border-slate-600 metal-btn'
                            }`}>
                            {opt.emoji} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {report && report.status !== 'empty' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">ราคา:</span>
                        <input type="number" step="0.01" value={report.price || ''} onChange={(e) => updatePrice(fuel.key, e.target.value)}
                          placeholder="เช่น 36.44"
                          className="w-28 metal-input rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none" />
                        <span className="text-xs text-slate-500">บาท/ลิตร</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">หมายเหตุ <span className="text-slate-600">(ไม่บังคับ)</span></label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น คิวยาว, หัวจ่ายบางตัวปิด..."
              rows={2}
              className="w-full metal-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none resize-none" />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit}
            disabled={!reporterName.trim() || fuelReports.length === 0 || submitting}
            className="w-full flex items-center justify-center gap-2 metal-btn-accent disabled:opacity-40 disabled:shadow-none text-white font-semibold py-3.5 rounded-xl">
            <Send className="w-4 h-4" />
            {submitting ? 'กำลังส่ง...' : `ส่งรายงาน (${fuelReports.length} ชนิด)`}
          </button>

          <p className="text-[11px] text-center text-slate-600 pb-2">ข้อมูลจะเผยแพร่ทันทีเพื่อช่วยเหลือเพื่อนร่วมทาง</p>
        </div>
      </div>
    </div>
  );
}
