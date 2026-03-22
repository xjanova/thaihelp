'use client';

import { useRouter } from 'next/navigation';
import { UserCircle, Mail, AtSign, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUser, setUser } from '@/lib/user-auth';

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect
    const existingUser = getUser();
    if (existingUser) {
      router.replace('/');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nickname.trim();
    const mail = email.trim();

    // ต้องมีอย่างน้อย ชื่อเล่น หรือ อีเมล
    if (!name && !mail) {
      setError('กรุณาใส่ชื่อเล่น หรือ อีเมล อย่างน้อย 1 อย่าง');
      return;
    }

    // ถ้าใส่แค่อีเมล ใช้ส่วนหน้า @ เป็นชื่อ
    const finalName = name || mail.split('@')[0];
    setUser(finalName, mail || undefined);
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #060a12, #0a1020, #0c1428)' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <Image src="/logo.png" alt="ThaiHelp" width={80} height={80} className="mx-auto drop-shadow-2xl" />
          <h1 className="text-2xl font-bold mt-3">
            <span className="text-blue-400">Thai</span><span className="text-orange-400">Help</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">ชุมชนช่วยเหลือนักเดินทาง</p>
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="metal-panel rounded-2xl p-5 space-y-4">
          <div className="text-center mb-2">
            <UserCircle className="w-8 h-8 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-medium text-chrome">เข้าใช้งาน</p>
            <p className="text-[10px] text-slate-500">ใส่อย่างน้อย 1 อย่าง</p>
          </div>

          {/* ชื่อเล่น */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
              <UserCircle className="w-3 h-3" /> ชื่อเล่น
            </label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="เช่น สมชาย, มานี"
              className="w-full metal-input rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none" autoFocus />
          </div>

          {/* อีเมล */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
              <Mail className="w-3 h-3" /> อีเมล
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full metal-input rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none" />
          </div>

          {error && (
            <div className="metal-panel rounded-xl p-2.5 border-red-500/20 bg-red-500/5">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button type="submit"
            className="w-full metal-btn-accent text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
            <UserCircle className="w-5 h-5" />
            เข้าใช้งาน
          </button>

          <p className="text-[10px] text-slate-600 text-center">
            ไม่ต้องสมัครสมาชิก ไม่มีรหัสผ่าน แค่ระบุตัวตนเพื่อรายงาน
          </p>
        </form>
      </div>
    </div>
  );
}
