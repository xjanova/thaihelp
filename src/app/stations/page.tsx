'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { StationCard } from '@/components/stations/StationCard';
import { ReportModal } from '@/components/stations/ReportModal';
import { StationHero } from '@/components/stations/StationHero';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import { RefreshCw, MapPin, Search, SlidersHorizontal, Fuel as FuelIcon } from 'lucide-react';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { FUEL_TYPES, type GasStation, type FuelType } from '@/types';

export default function StationsPage() {
  const { position, loading: geoLoading } = useGeolocation();
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Radius slider (km) — default 10km
  const [radiusKm, setRadiusKm] = useState(10);
  const debouncedRadius = useDebounce(radiusKm, 500);

  // Fuel type filter
  const [fuelFilter, setFuelFilter] = useState<FuelType | ''>('');

  // Last fetch timestamp for anti-spam
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchStations = useCallback(async (radius?: number) => {
    // Anti-spam: minimum 3 seconds between fetches
    const now = Date.now();
    if (now - lastFetchTime < 3000 && lastFetchTime > 0) return;
    setLastFetchTime(now);

    try {
      setRefreshing(true);
      const r = (radius || debouncedRadius) * 1000; // convert km to meters
      const res = await fetch(
        `/api/stations?lat=${position.lat}&lng=${position.lng}&radius=${r}`
      );
      if (res.status === 429) {
        setError('คำขอมากเกินไป กรุณารอสักครู่');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStations(data.data);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [position, debouncedRadius, lastFetchTime]);

  useEffect(() => {
    if (!geoLoading) fetchStations();
  }, [geoLoading, debouncedRadius]);

  const handleReportSubmit = async () => {
    setShowReport(false);
    setSelectedStation(null);
    await fetchStations();
  };

  // Filter stations by search + fuel type
  const filteredStations = useMemo(() => {
    let result = stations;

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.vicinity.toLowerCase().includes(q) ||
        (s.brand && s.brand.toLowerCase().includes(q))
      );
    }

    // Fuel type filter — show only stations that have this fuel available
    if (fuelFilter) {
      result = result.filter((s) => {
        if (!s.fuelReports || s.fuelReports.length === 0) return true; // No reports = unknown = show
        const fuelReport = s.fuelReports.find((f) => f.fuelType === fuelFilter);
        return !fuelReport || fuelReport.status !== 'empty'; // Show if not reported empty
      });
    }

    return result;
  }, [stations, searchQuery, fuelFilter]);

  const stationsWithReports = filteredStations.filter((s) => s.totalReports && s.totalReports > 0);
  const stationsNoReports = filteredStations.filter((s) => !s.totalReports || s.totalReports === 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="pt-14 pb-20">
        <StationHero totalStations={stations.length} totalReports={stations.reduce((sum, s) => sum + (s.totalReports || 0), 0)} />

        <DemoBanner message="ปั๊มน้ำมันแสดงข้อมูลจริงจาก Google Places — รายงานน้ำมันเป็นตัวอย่าง (Demo)" />

        {/* Controls */}
        <div className="sticky top-14 z-40 glass px-4 py-3">
          <div className="metal-divider mb-3" />
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Search + Refresh */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาปั๊ม เช่น PTT, Shell..."
                  className="w-full metal-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
              <button
                onClick={() => fetchStations()}
                disabled={refreshing}
                className="metal-btn px-3 rounded-xl text-slate-400 hover:text-orange-400 disabled:opacity-50"
                title="รีเฟรช"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Radius Slider */}
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex-1">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                />
              </div>
              <span className="text-xs font-bold text-orange-400 w-16 text-right">{radiusKm} km</span>
            </div>

            {/* Fuel Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <FuelIcon className="w-4 h-4 text-orange-400 shrink-0" />
              <button
                onClick={() => setFuelFilter('')}
                className={`shrink-0 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  !fuelFilter
                    ? 'metal-btn-accent text-white border-orange-500/30'
                    : 'metal-btn text-slate-400 border-slate-700/50'
                }`}
              >
                ทั้งหมด
              </button>
              {FUEL_TYPES.slice(0, 6).map((fuel) => (
                <button
                  key={fuel.key}
                  onClick={() => setFuelFilter(fuelFilter === fuel.key ? '' : fuel.key)}
                  className={`shrink-0 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    fuelFilter === fuel.key
                      ? 'metal-btn-blue text-white border-blue-500/30'
                      : 'metal-btn text-slate-400 border-slate-700/50'
                  }`}
                >
                  {fuel.label}
                </button>
              ))}
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>รัศมี {radiusKm} กม. จากตำแหน่งของคุณ</span>
              <span className="ml-auto text-slate-600">{filteredStations.length} ปั๊ม</span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-400">กำลังค้นหาปั๊มน้ำมันใกล้คุณ...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mx-4 mt-6 metal-panel rounded-xl p-4 text-center border-red-500/15">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => fetchStations()} className="mt-2 text-xs text-orange-400 hover:underline">ลองใหม่</button>
          </div>
        )}

        {/* Station List */}
        {!loading && (
          <div className="max-w-2xl mx-auto px-4 mt-4 space-y-6">
            {stationsWithReports.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-3 px-1">
                  📊 มีรายงานจากเพื่อนร่วมทาง
                </h3>
                <div className="space-y-3">
                  {stationsWithReports.map((station) => (
                    <StationCard key={station.place_id} station={station}
                      onReport={() => { setSelectedStation(station); setShowReport(true); }} />
                  ))}
                </div>
              </div>
            )}

            {stationsNoReports.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-1">
                  🏪 ปั๊มน้ำมันใกล้เคียง — ยังไม่มีรายงาน
                </h3>
                <div className="space-y-3">
                  {stationsNoReports.map((station) => (
                    <StationCard key={station.place_id} station={station}
                      onReport={() => { setSelectedStation(station); setShowReport(true); }} />
                  ))}
                </div>
              </div>
            )}

            {filteredStations.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-500">
                <p>ไม่พบปั๊มน้ำมัน{fuelFilter ? ` ที่มี${FUEL_TYPES.find(f => f.key === fuelFilter)?.label}` : ''}</p>
                <p className="text-xs mt-1">ลองขยายรัศมีหรือเปลี่ยนตัวกรอง</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showReport && selectedStation && (
        <ReportModal station={selectedStation}
          onClose={() => { setShowReport(false); setSelectedStation(null); }}
          onSubmit={handleReportSubmit} />
      )}

      <BottomNav />
    </div>
  );
}
