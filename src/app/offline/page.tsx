'use client';

import { WifiOff, RefreshCw, Shield } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #060a12, #0a1020, #0c1428)' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div className="relative z-10 text-center max-w-sm space-y-6">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center mx-auto shadow-2xl border border-slate-600/30">
          <Shield className="w-10 h-10 text-slate-400" />
        </div>

        {/* Offline icon */}
        <div className="metal-panel rounded-2xl p-6 inline-flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/5 flex items-center justify-center border border-red-500/20">
            <WifiOff className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-chrome">ไม่มีสัญญาณอินเทอร์เน็ต</h1>
            <p className="text-sm text-slate-400 mt-2">
              กรุณาตรวจสอบการเชื่อมต่อของคุณ แล้วลองใหม่อีกครั้ง
            </p>
          </div>
        </div>

        {/* Retry */}
        <button
          onClick={() => window.location.reload()}
          className="metal-btn-accent flex items-center gap-2 mx-auto px-6 py-3 rounded-xl text-white font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          ลองใหม่
        </button>

        <p className="text-xs text-slate-600">
          ThaiHelp จะทำงานอัตโนมัติเมื่อมีสัญญาณ
        </p>
      </div>
    </div>
  );
}
