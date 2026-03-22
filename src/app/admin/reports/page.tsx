'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Fuel, Search, Trash2, Eye, Clock, Filter, Download } from 'lucide-react';
import type { StationReport } from '@/types';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<StationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewReport, setViewReport] = useState<StationReport | null>(null);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then(r => r.json())
      .then(d => { if (d.success) setReports(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const deleteReport = async (id: number) => {
    if (!confirm('ลบรายงานนี้?')) return;
    await fetch(`/api/admin/reports?id=${id}`, { method: 'DELETE' });
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reports.filter(r =>
    !search || r.stationName.toLowerCase().includes(search.toLowerCase()) ||
    r.reporterName.toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel: Record<string, string> = { available: '✅ มี', low: '⚠️ น้อย', empty: '❌ หมด' };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-chrome flex items-center gap-2">
              <Fuel className="w-5 h-5 text-orange-400" /> รายงานปั๊มน้ำมัน
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{reports.length} รายงานทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาปั๊ม / ผู้รายงาน"
                className="metal-input rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none w-56" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="metal-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left text-[11px] text-slate-500 uppercase tracking-wider px-5 py-3 font-medium">ปั๊ม</th>
                  <th className="text-left text-[11px] text-slate-500 uppercase tracking-wider px-5 py-3 font-medium">ผู้รายงาน</th>
                  <th className="text-left text-[11px] text-slate-500 uppercase tracking-wider px-5 py-3 font-medium">น้ำมัน</th>
                  <th className="text-left text-[11px] text-slate-500 uppercase tracking-wider px-5 py-3 font-medium">เวลา</th>
                  <th className="text-right text-[11px] text-slate-500 uppercase tracking-wider px-5 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm text-chrome">{r.stationName}</p>
                      <p className="text-[10px] text-slate-600">{r.placeId?.slice(0, 20)}...</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-slate-300">{r.reporterName}</p>
                      {r.reporterEmail && <p className="text-[10px] text-slate-600">{r.reporterEmail}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.fuelReports?.map((f, i) => (
                          <span key={i} className="text-[10px] metal-btn px-1.5 py-0.5 rounded">
                            {statusLabel[f.status] || f.status} {f.price ? `฿${f.price}` : ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {r.createdAt ? new Date(r.createdAt).toLocaleString('th-TH') : '-'}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewReport(r)} className="metal-btn p-1.5 rounded-lg text-blue-400 hover:text-blue-300" title="ดู">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteReport(r.id!)} className="metal-btn p-1.5 rounded-lg text-red-400 hover:text-red-300" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-600 text-sm">
                    {loading ? 'กำลังโหลด...' : 'ยังไม่มีรายงาน'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {viewReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setViewReport(null)}>
            <div className="metal-panel rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-chrome mb-4">รายละเอียดรายงาน</h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-slate-500">ปั๊ม:</span> <span className="text-white ml-2">{viewReport.stationName}</span></div>
                <div><span className="text-slate-500">ผู้รายงาน:</span> <span className="text-white ml-2">{viewReport.reporterName}</span></div>
                {viewReport.reporterEmail && <div><span className="text-slate-500">อีเมล:</span> <span className="text-white ml-2">{viewReport.reporterEmail}</span></div>}
                <div><span className="text-slate-500">หมายเหตุ:</span> <span className="text-white ml-2">{viewReport.note || '-'}</span></div>
                <div>
                  <span className="text-slate-500">น้ำมัน:</span>
                  <div className="mt-2 space-y-1">
                    {viewReport.fuelReports?.map((f, i) => (
                      <div key={i} className="metal-btn px-3 py-1.5 rounded-lg text-xs flex justify-between">
                        <span className="text-slate-300">{f.fuelType}</span>
                        <span>{statusLabel[f.status]} {f.price ? `฿${f.price}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div><span className="text-slate-500">พิกัด:</span> <span className="text-white ml-2">{viewReport.latitude}, {viewReport.longitude}</span></div>
              </div>
              <button onClick={() => setViewReport(null)} className="w-full metal-btn-blue text-white font-medium py-2.5 rounded-xl mt-5">ปิด</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
