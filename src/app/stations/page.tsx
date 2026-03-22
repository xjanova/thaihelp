'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { StationCard } from '@/components/stations/StationCard';
import { ReportModal } from '@/components/stations/ReportModal';
import { StationHero } from '@/components/stations/StationHero';
import { useGeolocation } from '@/hooks/useGeolocation';
import { RefreshCw, MapPin, Search } from 'lucide-react';
import type { GasStation } from '@/types';

export default function StationsPage() {
  const { position, loading: geoLoading } = useGeolocation();
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStations = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(
        `/api/stations?lat=${position.lat}&lng=${position.lng}&radius=15000`
      );
      const data = await res.json();
      if (data.success) {
        setStations(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [position]);

  useEffect(() => {
    if (!geoLoading) {
      fetchStations();
    }
  }, [geoLoading, fetchStations]);

  const handleReportSubmit = async () => {
    setShowReport(false);
    setSelectedStation(null);
    await fetchStations();
  };

  const filteredStations = stations.filter((s) =>
    searchQuery
      ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.vicinity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.brand && s.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const stationsWithReports = filteredStations.filter((s) => s.totalReports && s.totalReports > 0);
  const stationsNoReports = filteredStations.filter((s) => !s.totalReports || s.totalReports === 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="pt-14 pb-20">
        {/* Hero Section */}
        <StationHero totalStations={stations.length} totalReports={stations.reduce((sum, s) => sum + (s.totalReports || 0), 0)} />

        {/* Search + Controls */}
        <div className="sticky top-14 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาปั๊ม เช่น PTT, Shell..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                onClick={fetchStations}
                disabled={refreshing}
                className="px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-orange-400 hover:border-orange-500/50 transition-all disabled:opacity-50"
                title="รีเฟรช"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>แสดงปั๊มในรัศมี 15 กม. จากตำแหน่งของคุณ</span>
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
          <div className="mx-4 mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchStations}
              className="mt-2 text-sm text-orange-400 hover:underline"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Station List */}
        {!loading && (
          <div className="max-w-2xl mx-auto px-4 mt-4 space-y-6">
            {/* Stations with reports first */}
            {stationsWithReports.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-3 px-1">
                  📊 มีรายงานจากเพื่อนร่วมทาง
                </h3>
                <div className="space-y-3">
                  {stationsWithReports.map((station) => (
                    <StationCard
                      key={station.place_id}
                      station={station}
                      onReport={() => {
                        setSelectedStation(station);
                        setShowReport(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stations without reports */}
            {stationsNoReports.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-1">
                  🏪 ปั๊มน้ำมันใกล้เคียง — ยังไม่มีรายงาน
                </h3>
                <div className="space-y-3">
                  {stationsNoReports.map((station) => (
                    <StationCard
                      key={station.place_id}
                      station={station}
                      onReport={() => {
                        setSelectedStation(station);
                        setShowReport(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredStations.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-500">
                <p>ไม่พบปั๊มน้ำมันที่ตรงกับการค้นหา</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReport && selectedStation && (
        <ReportModal
          station={selectedStation}
          onClose={() => {
            setShowReport(false);
            setSelectedStation(null);
          }}
          onSubmit={handleReportSubmit}
        />
      )}

      <BottomNav />
    </div>
  );
}
