'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error);
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #040810, #0a1020, #060e1c)' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_60%)]" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-800 flex items-center justify-center shadow-2xl shadow-cyan-500/20 border border-cyan-400/30 mx-auto">
              <Lock className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50" />
          </div>
          <h1 className="text-2xl font-bold text-chrome mt-4">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">ThaiHelp Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="metal-panel rounded-2xl p-6 space-y-5">
          {/* First-time notice */}
          <div className="flex items-start gap-2 bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-cyan-300/70 leading-relaxed">
              ครั้งแรก: ใช้ username <code className="text-cyan-400 font-mono">admin</code> / password <code className="text-cyan-400 font-mono">ThaiHelp@2026!</code>
              <br />แนะนำให้เปลี่ยนใน .env.local หลัง login
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">ชื่อผู้ใช้</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full metal-input rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none"
                autoFocus />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full metal-input rounded-xl pl-10 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <button type="submit" disabled={!username || !password || loading}
            className="w-full metal-btn-accent disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
            style={{ background: loading ? undefined : 'linear-gradient(180deg, #22d3ee 0%, #06b6d4 40%, #0891b2 100%)' }}>
            <Lock className="w-4 h-4" />
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-xs text-slate-600 text-center mt-4">
          <Shield className="w-3 h-3 inline mr-1" />
          xman studio • Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}
