'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AlertTriangle, Search, Trash2, Eye, Clock, Power, PowerOff } from 'lucide-react';

const categoryConfig: Record<string, { emoji: string; label: string; color: string }> = {
  accident: { emoji: '🚗', label: 'อุบัติเหตุ', color: '#ef4444' },
  flood: { emoji: '🌊', label: 'น้ำท่วม', color: '#3b82f6' },
  roadblock: { emoji: '🚧', label: 'ถนนปิด', color: '#f97316' },
  checkpoint: { emoji: '👮', label: 'จุดตรวจ', color: '#8b5cf6' },
  construction: { emoji: '🏗️', label: 'ก่อสร้าง', color: '#eab308' },
  other: { emoji: '⚠️', label: 'อื่นๆ', color: '#6b7280' },
};

interface Incident {
  id: number; category: string; title: string; description: string;
  latitude: number; longitude: number; upvotes: number; isActive: boolean; createdAt: string;
}

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/incidents')
      .then(r => r.json())
      .then(d => { if (d.success) setIncidents(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: number, isActive: boolean) => {
    await fetch('/api/admin/incidents', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, isActive: !isActive } : i));
  };

  const deleteIncident = async (id: number) => {
    if (!confirm('ลบเหตุการณ์นี้?')) return;
    await fetch(`/api/admin/incidents?id=${id}`, { method: 'DELETE' });
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  const filtered = incidents.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.category.includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-chrome flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> จัดการเหตุการณ์
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{incidents.filter(i => i.isActive).length} active / {incidents.length} ทั้งหมด</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาเหตุการณ์..."
              className="metal-input rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none w-56" />
          </div>
        </div>

        <div className="metal-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">ประเภท</th>
                  <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">เหตุการณ์</th>
                  <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">สถานะ</th>
                  <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">ยืนยัน</th>
                  <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">เวลา</th>
                  <th className="text-right text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filtered.map((i) => {
                  const cat = categoryConfig[i.category] || categoryConfig.other;
                  return (
                    <tr key={i.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-lg mr-1">{cat.emoji}</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${cat.color}15`, color: cat.color }}>{cat.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-chrome">{i.title}</p>
                        <p className="text-[10px] text-slate-600">{i.description}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          i.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-600/15 text-slate-500'
                        }`}>
                          {i.isActive ? '● Active' : '○ ปิด'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-yellow-500 font-medium">{i.upvotes}</td>
                      <td className="px-5 py-3">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(i.createdAt).toLocaleString('th-TH')}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleActive(i.id, i.isActive)}
                            className={`metal-btn p-1.5 rounded-lg ${i.isActive ? 'text-yellow-400' : 'text-emerald-400'}`}
                            title={i.isActive ? 'ปิดเหตุการณ์' : 'เปิดเหตุการณ์'}>
                            {i.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => deleteIncident(i.id)} className="metal-btn p-1.5 rounded-lg text-red-400" title="ลบ">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-600 text-sm">
                    {loading ? 'กำลังโหลด...' : 'ยังไม่มีเหตุการณ์'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
