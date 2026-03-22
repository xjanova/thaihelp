'use client';

import { useState } from 'react';
import { X, Send, Mic, MicOff, CheckCircle2, Volume2 } from 'lucide-react';
import { FUEL_TYPES, type GasStation, type FuelReport, type FuelStatus, type FuelType } from '@/types';
import { useSpeech } from '@/hooks/useSpeech';

interface ReportModalProps {
  station: GasStation;
  onClose: () => void;
  onSubmit: () => void;
}

const STATUS_OPTIONS: { value: FuelStatus; label: string; emoji: string; cls: string }[] = [
  { value: 'available', label: 'มี', emoji: '✅', cls: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
  { value: 'low', label: 'เหลือน้อย', emoji: '⚠️', cls: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
  { value: 'empty', label: 'หมด', emoji: '❌', cls: 'border-red-500 bg-red-500/10 text-red-400' },
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
        // If same status, remove (toggle off)
        if (prev[existing].status === status) {
          return prev.filter((_, i) => i !== existing);
        }
        // Change status
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status };
        return updated;
      }
      return [...prev, { fuelType, status }];
    });
  };

  const updatePrice = (fuelType: FuelType, price: string) => {
    setFuelReports((prev) => {
      const existing = prev.findIndex((f) => f.fuelType === fuelType);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          price: price ? parseFloat(price) : undefined,
        };
        return updated;
      }
      return prev;
    });
  };

  const handleVoiceReport = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        // Parse voice: try to understand fuel status from speech
        parseVoiceTranscript(transcript);
      }
    } else {
      listen();
    }
  };

  const parseVoiceTranscript = (text: string) => {
    const lower = text.toLowerCase();
    const newReports: FuelReport[] = [];

    for (const fuel of FUEL_TYPES) {
      const fuelMentioned =
        lower.includes(fuel.label.toLowerCase()) ||
        lower.includes(fuel.labelEn.toLowerCase()) ||
        lower.includes(fuel.key);

      if (fuelMentioned) {
        let status: FuelStatus = 'available';
        if (lower.includes('หมด') || lower.includes('ไม่มี') || lower.includes('empty')) {
          status = 'empty';
        } else if (lower.includes('น้อย') || lower.includes('เหลือน้อย') || lower.includes('low')) {
          status = 'low';
        }

        // Try to extract price
        const priceMatch = text.match(/(\d+\.?\d*)\s*(บาท|baht)/i);
        newReports.push({
          fuelType: fuel.key,
          status,
          price: priceMatch ? parseFloat(priceMatch[1]) : undefined,
        });
      }
    }

    if (newReports.length > 0) {
      setFuelReports((prev) => {
        const merged = [...prev];
        for (const nr of newReports) {
          const idx = merged.findIndex((f) => f.fuelType === nr.fuelType);
          if (idx >= 0) merged[idx] = nr;
          else merged.push(nr);
        }
        return merged;
      });
      sayText(`เข้าใจแล้วค่ะ บันทึกข้อมูลน้ำมัน ${newReports.length} ประเภท`);
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
          placeId: station.place_id,
          stationName: station.name,
          reporterName: reporterName.trim(),
          reporterEmail: reporterEmail.trim() || undefined,
          fuelReports,
          note: note.trim(),
          latitude: station.latitude,
          longitude: station.longitude,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        sayText('ขอบคุณที่รายงานค่ะ ข้อมูลจะช่วยเพื่อนร่วมทาง');
        setTimeout(() => onSubmit(), 2000);
      }
    } catch {
      console.error('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-slate-900 rounded-3xl border border-emerald-500/30 p-8 max-w-sm w-full text-center animate-in fade-in zoom-in">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">ขอบคุณครับ! 🙏</h3>
          <p className="text-slate-400 text-sm">
            ข้อมูลจะแสดงให้เพื่อนร่วมทางทราบทันที
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm rounded-t-3xl border-b border-slate-800 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-white">รายงานสถานะน้ำมัน</h2>
            <p className="text-xs text-slate-500 mt-0.5">{station.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Voice Report Button */}
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-2xl border border-orange-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-orange-400">🎤 รายงานด้วยเสียง</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  พูดว่า &quot;ดีเซลหมด แก๊สโซฮอล์ 95 มี 36 บาท&quot;
                </p>
              </div>
              <button
                onClick={handleVoiceReport}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-500/30'
                    : 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            {isListening && (
              <div className="bg-slate-900/60 rounded-xl p-3 mt-2 border border-slate-700">
                <p className="text-xs text-red-400 animate-pulse mb-1">กำลังฟัง...</p>
                <p className="text-sm text-white">{transcript || 'พูดได้เลยครับ...'}</p>
              </div>
            )}
          </div>

          {/* Reporter Info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                ชื่อผู้รายงาน <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="ชื่อเล่น หรือชื่อจริง"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                อีเมล <span className="text-slate-600">(ไม่บังคับ)</span>
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Fuel Grid */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-3 block">
              สถานะน้ำมัน <span className="text-red-400">*</span>
              <span className="text-slate-600 font-normal ml-1">กดเลือกสถานะแต่ละชนิด</span>
            </label>

            <div className="space-y-2">
              {FUEL_TYPES.map((fuel) => {
                const report = fuelReports.find((r) => r.fuelType === fuel.key);
                return (
                  <div
                    key={fuel.key}
                    className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: fuel.color }}
                        />
                        <span className="text-sm text-white font-medium">{fuel.label}</span>
                      </div>

                      {/* Status buttons */}
                      <div className="flex gap-1">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleFuel(fuel.key, opt.value)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                              report?.status === opt.value
                                ? opt.cls
                                : 'border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price input (only if selected) */}
                    {report && report.status !== 'empty' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">ราคา:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={report.price || ''}
                          onChange={(e) => updatePrice(fuel.key, e.target.value)}
                          placeholder="เช่น 36.44"
                          className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
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
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              หมายเหตุ <span className="text-slate-600">(ไม่บังคับ)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น คิวยาว, ปั๊มเปิดแต่หัวจ่ายบางตัวปิด..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!reporterName.trim() || fuelReports.length === 0 || submitting}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'กำลังส่ง...' : `ส่งรายงาน (${fuelReports.length} ชนิด)`}
          </button>

          <p className="text-[11px] text-center text-slate-600 pb-2">
            ข้อมูลจะเผยแพร่ทันทีเพื่อช่วยเหลือเพื่อนร่วมทาง
          </p>
        </div>
      </div>
    </div>
  );
}
