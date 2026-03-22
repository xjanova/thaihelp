'use client';

import { MapPin, Star, Clock, Navigation, MessageSquarePlus, ChevronRight } from 'lucide-react';
import { FUEL_TYPES, type GasStation, type FuelStatus } from '@/types';
import { timeAgo } from '@/lib/utils';

interface StationCardProps {
  station: GasStation;
  onReport: () => void;
}

const statusBadge: Record<FuelStatus, { label: string; cls: string }> = {
  available: { label: 'มี', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 shadow-emerald-500/10' },
  low: { label: 'เหลือน้อย', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25 shadow-yellow-500/10' },
  empty: { label: 'หมด', cls: 'bg-red-500/15 text-red-400 border-red-500/25 shadow-red-500/10' },
  unknown: { label: '?', cls: 'bg-slate-500/15 text-slate-500 border-slate-500/25' },
};

const brandAccent: Record<string, { border: string; glow: string }> = {
  PTT: { border: 'border-blue-500/15', glow: 'from-blue-500/8' },
  Shell: { border: 'border-yellow-500/15', glow: 'from-yellow-500/8' },
  Bangchak: { border: 'border-green-500/15', glow: 'from-green-500/8' },
  Esso: { border: 'border-red-500/15', glow: 'from-red-500/8' },
  Caltex: { border: 'border-red-500/15', glow: 'from-red-500/8' },
  Other: { border: 'border-slate-600/20', glow: 'from-slate-500/5' },
};

export function StationCard({ station, onReport }: StationCardProps) {
  const isOpen = station.opening_hours?.open_now;
  const hasReports = station.fuelReports && station.fuelReports.length > 0;
  const brand = brandAccent[station.brand || 'Other'] || brandAccent.Other;

  return (
    <div className={`metal-panel metal-panel-hover rounded-2xl overflow-hidden ${brand.border}`}>
      {/* Top gradient accent */}
      <div className={`h-[2px] bg-gradient-to-r ${brand.glow} via-transparent to-transparent`} />

      {/* Station Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {station.brand && station.brand !== 'Other' && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 metal-btn rounded px-2 py-0.5">
                  {station.brand}
                </span>
              )}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                isOpen === true
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isOpen === false
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-slate-600/10 text-slate-500 border-slate-600/20'
              }`}>
                {isOpen === true ? '● เปิด' : isOpen === false ? '● ปิด' : '—'}
              </span>
            </div>
            <h3 className="text-chrome font-semibold text-sm truncate">{station.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{station.vicinity}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            {station.distance !== undefined && (
              <div className="flex items-center gap-1 text-orange-400">
                <Navigation className="w-3 h-3" />
                <span className="text-sm font-bold drop-shadow-[0_0_4px_rgba(249,115,22,0.3)]">{station.distance} km</span>
              </div>
            )}
            {station.rating && (
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_3px_rgba(234,179,8,0.4)]" />
                <span>{station.rating}</span>
                <span className="text-slate-600">({station.user_ratings_total})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fuel Reports Grid */}
      {hasReports && (
        <div className="px-4 pb-3">
          <div className="metal-divider mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {station.fuelReports!.map((fuel) => {
              const fuelInfo = FUEL_TYPES.find((f) => f.key === fuel.fuelType);
              const badge = statusBadge[fuel.status];
              return (
                <div
                  key={fuel.fuelType}
                  className="bg-gradient-to-b from-slate-800/40 to-slate-900/60 rounded-lg px-2.5 py-2 flex items-center justify-between gap-1 border border-slate-700/30"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 truncate">
                      {fuelInfo?.label || fuel.fuelType}
                    </p>
                    {fuel.price && (
                      <p className="text-xs font-bold text-chrome">
                        ฿{fuel.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shadow-sm shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>

          {station.lastReportAt && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
              <Clock className="w-3 h-3" />
              <span>อัปเดต {timeAgo(new Date(station.lastReportAt))}</span>
              <span>• {station.totalReports} รายงาน</span>
            </div>
          )}
        </div>
      )}

      {/* Report CTA */}
      <div className="metal-divider" />
      <button
        onClick={onReport}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-orange-400 text-sm font-medium transition-all hover:bg-orange-500/5 group"
      >
        <MessageSquarePlus className="w-4 h-4 group-hover:drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]" />
        {hasReports ? 'อัปเดตรายงาน' : 'รายงานสถานะน้ำมัน'}
        <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
