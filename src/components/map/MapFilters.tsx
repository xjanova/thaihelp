'use client';

import { Fuel, AlertTriangle, RefreshCw, Clock, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MapFilter = 'all' | 'stations' | 'incidents' | 'oil_producers';

interface MapFiltersProps {
  filter: MapFilter;
  onChange: (filter: MapFilter) => void;
  stationCount: number;
  incidentCount: number;
  oilProducerCount: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
}

export function MapFilters({
  filter,
  onChange,
  stationCount,
  incidentCount,
  oilProducerCount,
  lastUpdated,
  onRefresh,
  refreshing,
}: MapFiltersProps) {
  const filters: { value: MapFilter; label: string; icon: typeof Fuel; count: number; color: string }[] = [
    { value: 'all', label: 'ทั้งหมด', icon: RefreshCw, count: stationCount + incidentCount + oilProducerCount, color: 'orange' },
    { value: 'stations', label: 'ปั๊ม', icon: Fuel, count: stationCount, color: 'blue' },
    { value: 'incidents', label: 'เหตุการณ์', icon: AlertTriangle, count: incidentCount, color: 'red' },
    { value: 'oil_producers', label: 'น้ำมันทำเอง', icon: Leaf, count: oilProducerCount, color: 'green' },
  ];

  return (
    <div className="absolute top-4 left-4 right-20 z-10">
      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-lg backdrop-blur-sm border',
              filter === f.value
                ? 'bg-white text-slate-900 border-white shadow-white/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            )}
          >
            <f.icon className="w-3.5 h-3.5" />
            <span>{f.label}</span>
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
              filter === f.value ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-400'
            )}>
              {f.count}
            </span>
          </button>
        ))}

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:border-orange-500/50 transition-all shadow-lg backdrop-blur-sm disabled:opacity-50"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
        </button>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400/70 ml-1">
          <Clock className="w-2.5 h-2.5" />
          <span>อัปเดต: {lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-slate-600">• รีเฟรชอัตโนมัติทุก 30 วิ</span>
        </div>
      )}
    </div>
  );
}
