'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database, CheckCircle2, XCircle, Loader2, Zap,
  ArrowRight, Map, Bot, Globe, Rocket, Shield
} from 'lucide-react';

type Step = 'check' | 'create' | 'config' | 'done';

interface DbStatus {
  success: boolean;
  tables: string[];
  missingTables: string[];
  isComplete: boolean;
  setupCompleted: boolean;
}

export default function AdminSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('check');
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteName, setSiteName] = useState('ThaiHelp');
  const [siteDesc, setSiteDesc] = useState('ชุมชนช่วยเหลือนักเดินทาง');
  const [mapLat, setMapLat] = useState('13.7563');
  const [mapLng, setMapLng] = useState('100.5018');

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/db/setup');
      const data = await res.json();
      setDbStatus(data);
      if (data.setupCompleted) {
        router.push('/admin/dashboard');
        return;
      }
      if (data.isComplete) {
        setStep('config');
      }
    } catch (e) {
      setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  const createTables = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/db/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await checkDatabase();
        setStep('config');
      } else {
        setError(data.error || 'สร้างตารางไม่สำเร็จ');
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาด: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const settings = {
        site_name: siteName,
        site_description: siteDesc,
        default_map_lat: mapLat,
        default_map_lng: mapLng,
        setup_completed: 'true',
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
      } else {
        setError(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาด: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  const requiredTables = ['users', 'incidents', 'station_reports', 'fuel_reports', 'incident_votes', 'site_settings', 'admin_logs'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ThaiHelp Setup</h1>
          <p className="text-sm text-slate-400 mt-1">ตั้งค่าระบบครั้งแรก</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['check', 'create', 'config', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-cyan-500 text-white scale-110' :
                (['check', 'create', 'config', 'done'].indexOf(step) > i) ? 'bg-emerald-500 text-white' :
                'bg-slate-800 text-slate-500'
              }`}>
                {(['check', 'create', 'config', 'done'].indexOf(step) > i) ? '✓' : i + 1}
              </div>
              {i < 3 && <div className={`w-8 h-0.5 ${(['check', 'create', 'config', 'done'].indexOf(step) > i) ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Step: Check DB */}
        {step === 'check' && (
          <div className="metal-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">ตรวจสอบฐานข้อมูล</h2>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบ...
              </div>
            ) : dbStatus ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {requiredTables.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-xs">
                      {dbStatus.tables.includes(t) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={dbStatus.tables.includes(t) ? 'text-emerald-400' : 'text-red-400'}>{t}</span>
                    </div>
                  ))}
                </div>

                {dbStatus.isComplete ? (
                  <button onClick={() => setStep('config')} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                    ถัดไป <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={createTables} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                    <Zap className="w-4 h-4" /> สร้างตารางที่ขาดหายไป
                  </button>
                )}
              </div>
            ) : (
              <button onClick={checkDatabase} className="w-full metal-btn py-3 rounded-xl text-sm text-cyan-400">
                ตรวจสอบอีกครั้ง
              </button>
            )}
          </div>
        )}

        {/* Step: Config */}
        {step === 'config' && (
          <div className="metal-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-orange-400" />
              <h2 className="text-lg font-bold text-white">ตั้งค่าเว็บไซต์</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">ชื่อเว็บไซต์</label>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)}
                  className="w-full metal-input rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">คำอธิบาย</label>
                <input type="text" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)}
                  className="w-full metal-input rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block flex items-center gap-1"><Map className="w-3 h-3" /> Latitude</label>
                  <input type="text" value={mapLat} onChange={(e) => setMapLat(e.target.value)}
                    className="w-full metal-input rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block flex items-center gap-1"><Map className="w-3 h-3" /> Longitude</label>
                  <input type="text" value={mapLng} onChange={(e) => setMapLng(e.target.value)}
                    className="w-full metal-input rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-3 space-y-2">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><Shield className="w-3 h-3" /> ฟีเจอร์ที่เปิดใช้งาน:</p>
              <div className="flex flex-wrap gap-2">
                {['น้องหญิง AI', 'แจ้งเหตุบนถนน', 'รายงานปั๊มน้ำมัน', 'PWA', 'Voice Commands'].map((f) => (
                  <span key={f} className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">{f}</span>
                ))}
              </div>
            </div>

            <button onClick={saveConfig} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {loading ? 'กำลังบันทึก...' : 'เสร็จสิ้นการตั้งค่า'}
            </button>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="metal-panel rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">ตั้งค่าเสร็จสมบูรณ์!</h2>
            <p className="text-sm text-slate-400">ระบบ ThaiHelp พร้อมใช้งานแล้ว</p>

            <div className="bg-slate-800/30 rounded-xl p-4 text-left space-y-2">
              <p className="text-xs text-slate-500 font-medium">สิ่งที่ควรทำต่อ:</p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2"><span className="text-orange-400">1.</span> ตั้งค่า Google Maps API Key ใน .env.local</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">2.</span> ตั้งค่า Groq API Key สำหรับน้องหญิง AI</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">3.</span> เปลี่ยนรหัสผ่าน Admin ใน .env.local</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">4.</span> Restart app ด้วย pm2 restart thaihelp</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push('/admin/dashboard')}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                ไป Dashboard
              </button>
              <button onClick={() => router.push('/admin/settings')}
                className="flex-1 metal-btn py-3 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                ตั้งค่าเพิ่มเติม
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
