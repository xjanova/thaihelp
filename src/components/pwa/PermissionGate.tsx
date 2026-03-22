'use client';

import { useEffect, useState } from 'react';
import { MapPin, Mic, Shield, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'checking';

export function PermissionGate({ children }: { children: React.ReactNode }) {
  const [gpsStatus, setGpsStatus] = useState<PermissionStatus>('prompt');
  const [micStatus, setMicStatus] = useState<PermissionStatus>('prompt');
  const [showGate, setShowGate] = useState(false); // Start hidden, show after check
  const [requesting, setRequesting] = useState(false);

  // Check existing permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      // Check if already granted before (stored in localStorage)
      const wasGranted = localStorage.getItem('thaihelp_permissions_granted');
      if (wasGranted === 'true') {
        setShowGate(false);
        // Still request GPS silently
        navigator.geolocation?.getCurrentPosition(() => {}, () => {});
        return;
      }

      // Check GPS + Mic, then show gate if not granted
      let gps: PermissionStatus = 'prompt';
      let mic: PermissionStatus = 'prompt';

      try {
        if ('permissions' in navigator) {
          const gpsResult = await navigator.permissions.query({ name: 'geolocation' });
          gps = gpsResult.state as PermissionStatus;
          setGpsStatus(gps);
        }
      } catch { /* ignore */ }

      try {
        if ('permissions' in navigator) {
          const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          mic = micResult.state as PermissionStatus;
          setMicStatus(mic);
        }
      } catch { /* ignore */ }

      // Only show gate if permissions are NOT already granted
      if (gps !== 'granted' || mic !== 'granted') {
        setShowGate(true);
      }
    };

    checkPermissions();
  }, []);

  const requestPermissions = async () => {
    setRequesting(true);

    // Request GPS
    try {
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => { setGpsStatus('granted'); resolve(); },
          (err) => {
            setGpsStatus(err.code === 1 ? 'denied' : 'granted');
            resolve(); // Continue even if denied
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } catch {
      setGpsStatus('denied');
    }

    // Request Microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // Stop immediately, just needed permission
      setMicStatus('granted');
    } catch {
      setMicStatus('denied');
    }

    // Mark as done
    localStorage.setItem('thaihelp_permissions_granted', 'true');
    setRequesting(false);

    // Auto-close after short delay
    setTimeout(() => setShowGate(false), 800);
  };

  const skipPermissions = () => {
    localStorage.setItem('thaihelp_permissions_granted', 'true');
    setShowGate(false);
  };

  // Already granted or dismissed — render children immediately
  if (!showGate) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #060a12, #0a1020, #0c1428)' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.05),transparent_50%)]" />

      <div className="w-full max-w-sm relative z-10 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Image src="/logo.png" alt="ThaiHelp" width={80} height={80} className="mx-auto drop-shadow-2xl" />
          <h1 className="text-2xl font-bold mt-3">
            <span className="text-blue-400">Thai</span><span className="text-orange-400">Help</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">ชุมชนช่วยเหลือนักเดินทาง</p>
        </div>

        {/* Permission Card */}
        <div className="metal-panel rounded-2xl p-5 space-y-4">
          <div className="text-center mb-2">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h2 className="text-sm font-bold text-chrome">อนุญาตการเข้าถึง</h2>
            <p className="text-[11px] text-slate-500 mt-1">เพื่อค้นหาปั๊มน้ำมันใกล้คุณ และรายงานด้วยเสียง</p>
          </div>

          {/* GPS Permission */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            gpsStatus === 'granted'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : gpsStatus === 'denied'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-blue-500/5 border-blue-500/15'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              gpsStatus === 'granted' ? 'bg-emerald-500/15 border-emerald-500/20' :
              gpsStatus === 'denied' ? 'bg-red-500/15 border-red-500/20' :
              'bg-blue-500/15 border-blue-500/20'
            }`}>
              <MapPin className={`w-5 h-5 ${
                gpsStatus === 'granted' ? 'text-emerald-400' :
                gpsStatus === 'denied' ? 'text-red-400' : 'text-blue-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-chrome">ตำแหน่ง GPS</p>
              <p className="text-[10px] text-slate-500">ค้นหาปั๊มน้ำมันใกล้คุณ</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
              gpsStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' :
              gpsStatus === 'denied' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-600/20 text-slate-400'
            }`}>
              {gpsStatus === 'granted' ? '✓ อนุญาต' : gpsStatus === 'denied' ? '✕ ปฏิเสธ' : 'รอกด'}
            </span>
          </div>

          {/* Mic Permission */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            micStatus === 'granted'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : micStatus === 'denied'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-orange-500/5 border-orange-500/15'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              micStatus === 'granted' ? 'bg-emerald-500/15 border-emerald-500/20' :
              micStatus === 'denied' ? 'bg-red-500/15 border-red-500/20' :
              'bg-orange-500/15 border-orange-500/20'
            }`}>
              <Mic className={`w-5 h-5 ${
                micStatus === 'granted' ? 'text-emerald-400' :
                micStatus === 'denied' ? 'text-red-400' : 'text-orange-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-chrome">ไมโครโฟน</p>
              <p className="text-[10px] text-slate-500">รายงานด้วยเสียง / สั่ง AI</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
              micStatus === 'granted' ? 'bg-emerald-500/20 text-emerald-400' :
              micStatus === 'denied' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-600/20 text-slate-400'
            }`}>
              {micStatus === 'granted' ? '✓ อนุญาต' : micStatus === 'denied' ? '✕ ปฏิเสธ' : 'รอกด'}
            </span>
          </div>

          {/* Request Button */}
          {gpsStatus !== 'granted' || micStatus !== 'granted' ? (
            <button
              onClick={requestPermissions}
              disabled={requesting}
              className="w-full metal-btn-accent text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {requesting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> กำลังขออนุญาต...</>
              ) : (
                <><Shield className="w-5 h-5" /> อนุญาตทั้งหมด</>
              )}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-emerald-400 text-sm font-medium mb-2">✓ พร้อมใช้งาน!</p>
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mx-auto" />
            </div>
          )}

          {/* Skip */}
          <button
            onClick={skipPermissions}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors py-1 flex items-center justify-center gap-1"
          >
            ข้ามไปก่อน <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <p className="text-[9px] text-slate-700 text-center">
          ข้อมูลตำแหน่งใช้เฉพาะค้นหาปั๊มใกล้เคียง ไม่เก็บข้อมูลส่วนตัว
        </p>
      </div>
    </div>
  );
}
