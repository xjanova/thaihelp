'use client';

import { useRouter } from 'next/navigation';
import { Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) router.push('/');
  }, [user, loading, router]);

  const handleLogin = async () => {
    try { setError(null); await signInWithGoogle(); } catch { setError('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--metal-dark)]">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #060a12, #0a1020, #0c1428)' }}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.04),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div className="w-full max-w-sm space-y-7 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 flex items-center justify-center shadow-2xl shadow-orange-500/25 border border-orange-400/30 mx-auto mb-4">
              <Shield className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            {/* Orbital glow */}
            <div className="absolute -inset-3 rounded-3xl border border-orange-500/10 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
          </div>
          <h1 className="text-3xl font-bold text-chrome mt-2">ThaiHelp</h1>
          <p className="text-slate-400 mt-1">ช่วยเหลือคนไทยเดินทาง</p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {[
            { text: 'แจ้งเหตุ Realtime บนแผนที่', icon: '🗺️' },
            { text: 'รายงานสถานะปั๊มน้ำมัน', icon: '⛽' },
            { text: 'สั่งงานด้วยเสียง AI', icon: '🤖' },
          ].map((feature) => (
            <div key={feature.text} className="metal-panel flex items-center gap-3 rounded-xl px-4 py-3">
              <span className="text-lg">{feature.icon}</span>
              <span className="text-sm text-slate-300">{feature.text}</span>
              <Zap className="w-3 h-3 text-cyan-500/40 ml-auto" />
            </div>
          ))}
        </div>

        {/* Login Button */}
        <button onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-xl transition-all shadow-xl shadow-white/10 border border-white/80 active:translate-y-0.5">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <p className="text-xs text-slate-600 text-center">เข้าสู่ระบบเพื่อแจ้งเหตุและช่วยเหลือเพื่อนร่วมทาง</p>
      </div>
    </div>
  );
}
