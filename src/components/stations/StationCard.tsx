'use client';

import { MapPin, Star, Clock, Navigation, MessageSquarePlus, ChevronRight } from 'lucide-react';
import { FUEL_TYPES, type GasStation, type FuelStatus } from '@/types';
import { timeAgo } from '@/lib/utils';

interface StationCardProps {
  station: GasStation;
  onReport: () => void;
}

const statusBadge: Record<FuelStatus, { label: string; cls: string }> = {
  available: { label: 'มี', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  low: { label: 'เหลือน้อย', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  empty: { label: 'หมด', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  unknown: { label: '?', cls: 'bg-slate-600/20 text-slate-500 border-slate-600/30' },
};

const brandColors: Record<string, string> = {
  PTT: 'from-blue-600/20 to-blue-800/5 border-blue-500/20',
  Shell: 'from-yellow-600/20 to-yellow-800/5 border-yellow-500/20',
  Bangchak: 'from-green-600/20 to-green-800/5 border-green-500/20',
  Esso: 'from-red-600/20 to-red-800/5 border-red-500/20',
  Caltex: 'from-red-600/20 to-red-800/5 border-red-500/20',
  Other: 'from-slate-700/20 to-slate-800/5 border-slate-600/20',
};

export function StationCard({ station, onReport }: StationCardProps) {
  const isOpen = station.opening_hours?.open_now;
  const hasReports = station.fuelReports && station.fuelReports.length > 0;
  const brandCls = brandColors[station.brand || 'Other'] || brandColors.Other;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${brandCls} overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/5`}>
      {/* Station Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Brand badge */}
              {station.brand && station.brand !== 'Other' && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-800/80 rounded px-1.5 py-0.5">
                  {station.brand}
                </span>
              )}
              {/* Open/closed */}
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                isOpen === true
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isOpen === false
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-600/20 text-slate-500'
              }`}>
                {isOpen === true ? 'เปิด' : isOpen === false ? 'ปิด' : '—'}
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm truncate">{station.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{station.vicinity}</span>
            </div>
          </div>

          {/* Distance + Rating */}
          <div className="text-right shrink-0">
            {station.distance !== undefined && (
              <div className="flex items-center gap-1 text-orange-400">
                <Navigation className="w-3 h-3" />
                <span className="text-sm font-bold">{station.distance} km</span>
              </div>
            )}
            {station.rating && (
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {station.fuelReports!.map((fuel) => {
              const fuelInfo = FUEL_TYPES.find((f) => f.key === fuel.fuelType);
              const badge = statusBadge[fuel.status];
              return (
                <div
                  key={fuel.fuelType}
                  className="bg-slate-900/40 rounded-lg px-2.5 py-2 flex items-center justify-between gap-1"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 truncate">
                      {fuelInfo?.label || fuel.fuelType}
                    </p>
                    {fuel.price && (
                      <p className="text-xs font-bold text-white">
                        ฿{fuel.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Report meta */}
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
      <button
        onClick={onReport}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/10 hover:bg-orange-500/20 border-t border-orange-500/10 text-orange-400 text-sm font-medium transition-colors"
      >
        <MessageSquarePlus className="w-4 h-4" />
        {hasReports ? 'อัปเดตรายงาน' : 'รายงานสถานะน้ำมัน'}
        <ChevronRight className="w-3 h-3 ml-auto" />
      </button>
    </div>
  );
}
