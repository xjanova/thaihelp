'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Fuel, AlertTriangle, Users, FileText,
  RefreshCw, Clock, ThumbsUp, Activity, TrendingUp
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-chrome">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">ภาพรวมระบบ ThaiHelp</p>
          </div>
          <button onClick={fetchStats} className="metal-btn px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'ปั๊มน้ำมัน', value: stats?.totalStations || 0, icon: Fuel, color: '#f97316', delta: '+2 วันนี้' },
            { label: 'เหตุการณ์ Active', value: stats?.activeIncidents || 0, icon: AlertTriangle, color: '#ef4444', delta: '3 กำลังดำเนิน' },
            { label: 'รายงานทั้งหมด', value: stats?.totalReports || 0, icon: FileText, color: '#2563eb', delta: '+8 วันนี้' },
            { label: 'ผู้ใช้งาน', value: stats?.totalUsers || 0, icon: Users, color: '#8b5cf6', delta: '+3 ใหม่' },
          ].map((stat) => (
            <div key={stat.label} className="metal-panel metal-panel-hover rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ background: `${stat.color}15`, borderColor: `${stat.color}25` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.delta}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-chrome">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two Column */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="metal-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-bold text-chrome">รายงานปั๊มล่าสุด</h2>
              </div>
              <a href="/admin/reports" className="text-[11px] text-blue-400 hover:underline">ดูทั้งหมด →</a>
            </div>
            <div className="metal-divider" />
            <div className="divide-y divide-slate-800/50">
              {(stats?.recentReports || []).map((r) => (
                <div key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-800/20 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/15 text-sm">⛽</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-chrome truncate">{r.station}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      {r.reporter} <span className="text-slate-600">•</span> <Clock className="w-2.5 h-2.5" />{r.time}
                    </p>
                  </div>
                  <span className="metal-btn text-[10px] px-2 py-1 rounded-lg text-blue-400 font-bold">{r.fuels} ชนิด</span>
                </div>
              ))}
              {(!stats?.recentReports?.length) && (
                <p className="text-sm text-slate-600 text-center py-8">ยังไม่มีรายงาน</p>
              )}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="metal-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-bold text-chrome">เหตุการณ์ล่าสุด</h2>
              </div>
              <a href="/admin/incidents" className="text-[11px] text-blue-400 hover:underline">ดูทั้งหมด →</a>
            </div>
            <div className="metal-divider" />
            <div className="divide-y divide-slate-800/50">
              {(stats?.recentIncidents || []).map((i) => (
                <div key={i.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-800/20 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/15 text-sm">
                    {categoryEmoji[i.category] || '⚠️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-chrome truncate">{i.title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      {i.category} <span className="text-slate-600">•</span> <Clock className="w-2.5 h-2.5" />{i.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <ThumbsUp className="w-3 h-3" /><span className="font-bold">{i.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
