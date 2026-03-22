'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, LogOut, Fuel, AlertTriangle, Users, FileText,
  RefreshCw, Clock, ThumbsUp, BarChart3, Activity, Settings,
  ChevronRight, ExternalLink
} from 'lucide-react';

interface Stats {
  totalStations: number;
  totalIncidents: number;
  totalReports: number;
  totalUsers: number;
  activeIncidents: number;
  recentReports: { id: number; station: string; reporter: string; time: string; fuels: number }[];
  recentIncidents: { id: number; title: string; category: string; reporter: string; time: string; upvotes: number }[];
}

const categoryEmoji: Record<string, string> = {
  accident: '🚗', flood: '🌊', roadblock: '🚧', checkpoint: '👮', construction: '🏗️', other: '⚠️',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      if (data.success) setStats(data.data);
      else setError(data.error);
    } catch { setError('ไม่สามารถโหลดข้อมูลได้'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060a14' }}>
        <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #040810, #0a1020)' }}>
      {/* Admin Header */}
      <header className="chrome-bar sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center border border-cyan-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-chrome">ThaiHelp Admin</h1>
              <div className="h-[1px] w-full bg-gradient-to-r from-cyan-500/50 to-transparent" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="metal-btn px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              ดูเว็บ
            </a>
            <button onClick={handleLogout} className="metal-btn px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              ออกจากระบบ
            </button>
          </div>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ปั๊มน้ำมัน', value: stats?.totalStations || 0, icon: Fuel, color: 'orange', glow: 'shadow-orange-500/10' },
            { label: 'เหตุการณ์ Active', value: stats?.activeIncidents || 0, icon: AlertTriangle, color: 'red', glow: 'shadow-red-500/10' },
            { label: 'รายงานทั้งหมด', value: stats?.totalReports || 0, icon: FileText, color: 'cyan', glow: 'shadow-cyan-500/10' },
            { label: 'ผู้ใช้งาน', value: stats?.totalUsers || 0, icon: Users, color: 'blue', glow: 'shadow-blue-500/10' },
          ].map((stat) => (
            <div key={stat.label} className={`metal-panel metal-panel-hover rounded-2xl p-5 ${stat.glow}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border`}
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${stat.color === 'orange' ? '#f97316' : stat.color === 'red' ? '#ef4444' : stat.color === 'cyan' ? '#06b6d4' : '#3b82f6'} 15%, transparent), transparent)`,
                    borderColor: `color-mix(in srgb, ${stat.color === 'orange' ? '#f97316' : stat.color === 'red' ? '#ef4444' : stat.color === 'cyan' ? '#06b6d4' : '#3b82f6'} 20%, transparent)`,
                  }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color === 'orange' ? '#f97316' : stat.color === 'red' ? '#ef4444' : stat.color === 'cyan' ? '#06b6d4' : '#3b82f6' }} />
                </div>
                <Activity className="w-4 h-4 text-slate-700" />
              </div>
              <p className="text-3xl font-bold text-chrome">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="metal-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-bold text-chrome">รายงานปั๊มน้ำมันล่าสุด</h2>
              </div>
              <button onClick={fetchStats} className="metal-btn p-1.5 rounded-lg text-slate-500 hover:text-orange-400">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="metal-divider" />
            <div className="divide-y divide-slate-800/50">
              {stats?.recentReports.map((r) => (
                <div key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-800/20 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/15 text-sm">
                    ⛽
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-chrome truncate">{r.station}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">{r.reporter}</span>
                      <span className="text-[11px] text-slate-600">•</span>
                      <span className="text-[11px] text-slate-600 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />{r.time}
                      </span>
                    </div>
                  </div>
                  <span className="metal-btn text-[10px] px-2 py-1 rounded-lg text-cyan-400 font-bold">
                    {r.fuels} ชนิด
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="metal-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-bold text-chrome">เหตุการณ์ล่าสุด</h2>
              </div>
              <span className="text-[10px] text-emerald-400 metal-btn px-2 py-1 rounded-lg font-medium">
                ● {stats?.activeIncidents || 0} Active
              </span>
            </div>
            <div className="metal-divider" />
            <div className="divide-y divide-slate-800/50">
              {stats?.recentIncidents.map((i) => (
                <div key={i.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-800/20 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/15 text-sm">
                    {categoryEmoji[i.category] || '⚠️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-chrome truncate">{i.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">{i.category}</span>
                      <span className="text-[11px] text-slate-600">•</span>
                      <span className="text-[11px] text-slate-600 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />{i.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-bold">{i.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'ตั้งค่าระบบ', icon: Settings, href: '#' },
            { label: 'จัดการปั๊ม', icon: Fuel, href: '#' },
            { label: 'ดูรายงานทั้งหมด', icon: FileText, href: '#' },
            { label: 'จัดการผู้ใช้', icon: Users, href: '#' },
          ].map((action) => (
            <button key={action.label} className="metal-panel metal-panel-hover rounded-xl p-4 flex items-center gap-3 text-left group">
              <action.icon className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm text-slate-400 group-hover:text-chrome transition-colors">{action.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-700 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
