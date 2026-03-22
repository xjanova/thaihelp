'use client';

import { Fuel, Users, Heart, Shield, Zap } from 'lucide-react';

interface StationHeroProps {
  totalStations: number;
  totalReports: number;
}

export function StationHero({ totalStations, totalReports }: StationHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1220] via-[#111d32] to-[#0a1628]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.06),transparent_60%)]" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative px-4 pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-5">
            <div className="metal-btn flex items-center gap-1.5 rounded-full px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-chrome">xman studio</span>
            </div>
            <div className="metal-btn flex items-center gap-1.5 rounded-full px-3 py-1.5">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-300">ไม่แสวงหากำไร</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="text-chrome">รายงานสถานะ</span>
            <span className="text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]"> ปั๊มน้ำมัน</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            ช่วยกันรายงานว่าปั๊มไหนมีน้ำมันอะไร ราคาเท่าไหร่ หมดหรือเหลือ
            เพื่อเพื่อนร่วมทางในยามวิกฤติ
          </p>

          {/* Stats */}
          <div className="flex gap-3 mt-5">
            <div className="metal-panel rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/5 flex items-center justify-center border border-orange-500/20">
                <Fuel className="w-5 h-5 text-orange-400 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-chrome">{totalStations}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">ปั๊มใกล้เคียง</p>
              </div>
            </div>
            <div className="metal-panel rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 flex items-center justify-center border border-cyan-500/20">
                <Users className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-chrome">{totalReports}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">รายงานจากเพื่อน</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom metallic divider */}
      <div className="metal-divider" />
    </div>
  );
}
