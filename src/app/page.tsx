'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MapView } from '@/components/map/MapView';
import { MapFilters, type MapFilter } from '@/components/map/MapFilters';
import { ReportModal } from '@/components/stations/ReportModal';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapData } from '@/hooks/useMapData';
import { useSpeech } from '@/hooks/useSpeech';
import { Mic, Plus, Fuel, AlertTriangle, MessageCircle, ChevronRight, Shield, Heart, Code2 } from 'lucide-react';
import Link from 'next/link';
import type { GasStation } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const { position, loading: geoLoading } = useGeolocation();
  const { stations, incidents, loading, lastUpdated, refresh } = useMapData(position);
  const { isListening, listen, stopListening, transcript } = useSpeech();

  const [showWelcome, setShowWelcome] = useState(true);
  const [mapFilter, setMapFilter] = useState<MapFilter>('all');
  const [reportStation, setReportStation] = useState<GasStation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-14 pb-16 relative">
        <MapView
          stations={stations}
          incidents={incidents}
          showStations={mapFilter === 'all' || mapFilter === 'stations'}
          showIncidents={mapFilter === 'all' || mapFilter === 'incidents'}
          onStationReport={(station) => setReportStation(station)}
        />

        {/* Welcome Overlay */}
        {showWelcome && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60 z-20 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-500/30 mb-4">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">ThaiHelp</h1>
                <p className="text-slate-400 mt-1">ช่วยเหลือคนไทยเดินทาง</p>
              </div>

              <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-400">ไม่แสวงหากำไร • ช่วยเหลือยามวิกฤติ</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  แอปช่วยเหลือคนไทยในยามที่บ้านเมืองต้องการความร่วมมือ
                  ช่วยกันรายงาน แจ้งเหตุ แชร์ข้อมูลน้ำมัน เพื่อเพื่อนร่วมทาง
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/stations" className="flex flex-col items-center gap-2 bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 rounded-2xl p-4 hover:border-blue-400/40 transition-all group">
                  <Fuel className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white">ปั๊มน้ำมัน</span>
                  <span className="text-[10px] text-slate-500">รายงานสถานะ</span>
                </Link>
                <Link href="/report" className="flex flex-col items-center gap-2 bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/20 rounded-2xl p-4 hover:border-red-400/40 transition-all group">
                  <AlertTriangle className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white">แจ้งเหตุ</span>
                  <span className="text-[10px] text-slate-500">Realtime</span>
                </Link>
                <Link href="/chat" className="flex flex-col items-center gap-2 bg-gradient-to-br from-purple-600/20 to-purple-800/10 border border-purple-500/20 rounded-2xl p-4 hover:border-purple-400/40 transition-all group">
                  <MessageCircle className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white">AI ช่วย</span>
                  <span className="text-[10px] text-slate-500">สั่งด้วยเสียง</span>
                </Link>
                <button onClick={() => setShowWelcome(false)} className="flex flex-col items-center gap-2 bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 border border-emerald-500/20 rounded-2xl p-4 hover:border-emerald-400/40 transition-all group">
                  <ChevronRight className="w-8 h-8 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  <span className="text-sm font-medium text-white">ดูแผนที่</span>
                  <span className="text-[10px] text-slate-500">เริ่มใช้งาน</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <Code2 className="w-3 h-3" />
                <span>สร้างโดย xman studio • เทคโนโลยีเพื่อสังคม</span>
              </div>
            </div>
          </div>
        )}

        {/* Map Controls (when map visible) */}
        {!showWelcome && (
          <>
            {/* Filters */}
            <MapFilters
              filter={mapFilter}
              onChange={setMapFilter}
              stationCount={stations.length}
              incidentCount={incidents.length}
              lastUpdated={lastUpdated}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            {/* FABs */}
            <div className="absolute bottom-6 right-4 flex flex-col gap-3 z-10">
              <button
                onClick={isListening ? stopListening : listen}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 animate-pulse scale-110'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                <Mic className="w-6 h-6 text-white" />
              </button>

              {user && (
                <Link
                  href="/report"
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-7 h-7 text-white" />
                </Link>
              )}
            </div>

            {/* Voice overlay */}
            {isListening && transcript && (
              <div className="absolute top-20 left-4 right-4 z-20 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                <p className="text-sm text-orange-400 mb-1">กำลังฟัง...</p>
                <p className="text-white">{transcript}</p>
              </div>
            )}

            {/* Login hint */}
            {!user && (
              <div className="absolute bottom-6 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 border border-slate-600">
                <p className="text-xs text-slate-300">
                  <Link href="/login" className="text-orange-400 font-medium hover:underline">
                    เข้าสู่ระบบ
                  </Link>{' '}
                  เพื่อแจ้งเหตุ
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Station Report Modal */}
      {reportStation && (
        <ReportModal
          station={reportStation}
          onClose={() => setReportStation(null)}
          onSubmit={() => {
            setReportStation(null);
            refresh();
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
