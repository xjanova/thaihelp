'use client';

import { useRouter } from 'next/navigation';
import { Zap, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) router.push('/');
  }, [user, loading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('กรุณาใส่ชื่อเล่น');
      return;
    }
    login(nickname, email);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060a14' }}>
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #060a12, #0a1020, #0c1428)' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div className="w-full max-w-sm space-y-7 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <Image src="/logo.png" alt="ThaiHelp" width={90} height={90} className="mx-auto drop-shadow-2xl" />
          <h1 className="text-3xl font-bold mt-3">
            <span className="text-blue-400">Thai</span><span className="text-orange-400">Help</span>
          </h1>
          <p className="text-slate-400 mt-1">ชุมชนช่วยเหลือนักเดินทาง</p>
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
              <Zap className="w-3 h-3 text-blue-500/40 ml-auto" />
            </div>
          ))}
        </div>

        {/* Login Form — simple nickname */}
        <form onSubmit={handleLogin} className="metal-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCircle className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-chrome">เข้าใช้งาน</span>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">ชื่อเล่น / นามแฝง <span className="text-red-400">*</span></label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="เช่น สมชาย, มานี"
              className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none" autoFocus />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">อีเมล <span className="text-slate-600">(ไม่บังคับ)</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full metal-input rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none" />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button type="submit"
            className="w-full metal-btn-accent text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
            <UserCircle className="w-5 h-5" />
            เข้าใช้งาน
          </button>

          <p className="text-[10px] text-slate-600 text-center">
            ไม่ต้องสมัครสมาชิก แค่ใส่ชื่อเล่นก็ใช้ได้เลย
          </p>
        </form>
      </div>
    </div>
  );
}
