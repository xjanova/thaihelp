'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MapView } from '@/components/map/MapView';
import { MapFilters, type MapFilter } from '@/components/map/MapFilters';
import { ReportModal } from '@/components/stations/ReportModal';
import { VoiceAssistant } from '@/components/voice/VoiceAssistant';
import { NongYingAvatar } from '@/components/voice/NongYingAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapData } from '@/hooks/useMapData';
import { useSpeech } from '@/hooks/useSpeech';
import { speak } from '@/lib/speech';
import { Mic, Plus, Fuel, AlertTriangle, MessageCircle, ChevronRight, Heart, Code2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { GasStation } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const { position, loading: geoLoading } = useGeolocation();
  const { stations, incidents, oilProducers, loading, lastUpdated, refresh } = useMapData(position);
  const { isListening, listen, stopListening, transcript } = useSpeech();

  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [greeted, setGreeted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const [mapFilter, setMapFilter] = useState<MapFilter>('all');
  const [reportStation, setReportStation] = useState<GasStation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // น้องหญิงทักทายตอนเข้าเว็บ
  useEffect(() => {
    if (showWelcome && !greeted) {
      const timer = setTimeout(() => {
        const hour = new Date().getHours();
        let greeting = '';
        if (hour < 12) {
          greeting = 'สวัสดีตอนเช้าค่ะ! หนูชื่อน้องหญิง ยินดีต้อนรับสู่ ThaiHelp จ้า! ';
        } else if (hour < 17) {
          greeting = 'สวัสดีตอนบ่ายค่ะ! หนูน้องหญิงเอง พร้อมช่วยเหลือพี่นักเดินทางจ้า! ';
        } else {
          greeting = 'สวัสดีตอนเย็นค่ะ! น้องหญิงอยู่ตรงนี้เลย พี่ต้องการอะไรพูดได้เลยนะคะ! ';
        }
        if (user) {
          greeting += `พี่${user.nickname} เดินทางปลอดภัยนะคะ! `;
        } else {
          greeting += 'กดปุ่มไมค์สีส้มเพื่อสั่งด้วยเสียงได้เลยค่ะ! ';
        }
        greeting += 'ใหม่ของวันนี้ค่ะ! ถ้าคุณผลิตน้ำมันเชื้อเพลิงเอง มาลงทะเบียนให้เพื่อนๆ หาคุณเจอค่ะ พร้อมนำราคาใส่ในระบบราคา น้องหญิงจะได้แนะนำได้ค่ะ';
        speak(greeting);
        setGreeted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, greeted, user]);

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
          oilProducers={oilProducers}
          showStations={mapFilter === 'all' || mapFilter === 'stations'}
          showIncidents={mapFilter === 'all' || mapFilter === 'incidents'}
          showOilProducers={mapFilter === 'all' || mapFilter === 'oil_producers'}
          onStationReport={(station) => setReportStation(station)}
        />

        {/* Welcome Overlay */}
        {showWelcome && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60 z-20 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-6">
              <div className="text-center">
                <Image src="/logo.png" alt="ThaiHelp" width={100} height={100} className="mx-auto mb-3 drop-shadow-2xl" />
                <h1 className="text-3xl font-bold">
                  <span className="text-blue-400">Thai</span><span className="text-orange-400">Help</span>
                </h1>
                <p className="text-slate-400 mt-1">ชุมชนช่วยเหลือนักเดินทาง</p>
              </div>

              {/* น้องหญิง Greeting */}
              <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 p-4">
                <div className="flex items-start gap-3">
                  <NongYingAvatar size={48} isSpeaking={greeted} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-400 mb-1">น้องหญิง AI</p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {mounted && user
                        ? `สวัสดีค่ะพี่${user.nickname}! หนูน้องหญิง พร้อมช่วยเหลือการเดินทางจ้า! ถ้าผลิตน้ำมันเชื้อเพลิงเอง มาลงทะเบียนเลยนะคะ!`
                        : 'สวัสดีค่ะ! หนูน้องหญิง AI ประจำแอป ThaiHelp ถ้าคุณผลิตน้ำมันเชื้อเพลิงเอง มาลงทะเบียนให้เพื่อนๆ หาคุณเจอค่ะ!'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-[10px] text-red-400/80">ไม่แสวงหากำไร • ช่วยเหลือยามวิกฤติ • by xman studio</span>
                </div>
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
                <button onClick={() => setShowWelcome(false)} className="flex flex-col items-center gap-2 bg-gradient-to-br from-cyan-600/20 to-cyan-800/10 border border-cyan-500/20 rounded-2xl p-4 hover:border-cyan-400/40 transition-all group">
                  <ChevronRight className="w-8 h-8 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  <span className="text-sm font-medium text-white">ดูแผนที่</span>
                  <span className="text-[10px] text-slate-500">เริ่มใช้งาน</span>
                </button>
              </div>

              {/* Oil Producer Registration Banner */}
              <Link href="/register-oil" className="flex items-center gap-3 bg-gradient-to-r from-orange-600/20 to-amber-800/10 border border-orange-500/20 rounded-2xl p-4 hover:border-orange-400/40 transition-all group">
                <Fuel className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-white block">ลงทะเบียนผู้ผลิตน้ำมัน</span>
                  <span className="text-[10px] text-slate-500">ไบโอดีเซล • น้ำมันพืชใช้แล้ว • เอทานอล • ดีเซลผสม</span>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-400/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <Code2 className="w-3 h-3" />
                <span>xman studio • {process.env.NEXT_PUBLIC_APP_VERSION || 'dev'}</span>
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
              oilProducerCount={oilProducers.length}
              lastUpdated={lastUpdated}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            {/* FABs */}
            {/* Report FAB */}
            <div className="absolute bottom-6 left-4 z-10">
              {user && (
                <Link
                  href="/report"
                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-6 h-6 text-white" />
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

      {/* Voice Assistant — always visible */}
      {!showWelcome && <VoiceAssistant stations={stations} />}

      <BottomNav />
    </div>
  );
}
