'use client';

import { Fuel, Users, Heart, Shield } from 'lucide-react';

interface StationHeroProps {
  totalStations: number;
  totalReports: number;
}

export function StationHero({ totalStations, totalReports }: StationHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-slate-900 to-blue-600/10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-3xl" />

      <div className="relative px-4 pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* xman studio badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400">xman studio</span>
            </div>
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400">ไม่แสวงหากำไร</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            รายงานสถานะ
            <span className="text-orange-400"> ปั๊มน้ำมัน</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            ช่วยกันรายงานว่าปั๊มไหนมีน้ำมันอะไร ราคาเท่าไหร่ หมดหรือเหลือ
            เพื่อเพื่อนร่วมทางในยามวิกฤติ
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-5">
            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur rounded-xl px-4 py-2.5 border border-slate-700/50">
              <Fuel className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-lg font-bold text-white">{totalStations}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">ปั๊มใกล้เคียง</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur rounded-xl px-4 py-2.5 border border-slate-700/50">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-lg font-bold text-white">{totalReports}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">รายงานจากเพื่อน</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
