'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, Shield, Clock, Mail, UserCheck, UserX } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'admin', email: 'admin@thaihelp.xman4289.com', role: 'admin', reports: 0, lastActive: 'ตอนนี้', status: 'active' },
  { id: '2', name: 'สมชาย', email: 'somchai@example.com', role: 'user', reports: 5, lastActive: '10 นาทีที่แล้ว', status: 'active' },
  { id: '3', name: 'มานี', email: 'manee@example.com', role: 'user', reports: 3, lastActive: '30 นาทีที่แล้ว', status: 'active' },
  { id: '4', name: 'วิชัย', email: 'wichai@test.com', role: 'user', reports: 8, lastActive: '1 ชั่วโมงที่แล้ว', status: 'active' },
  { id: '5', name: 'พิมพ์', email: '', role: 'user', reports: 2, lastActive: '2 ชั่วโมงที่แล้ว', status: 'active' },
  { id: '6', name: 'Guest_12345', email: '', role: 'guest', reports: 1, lastActive: '1 วันที่แล้ว', status: 'inactive' },
];

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-chrome flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> ผู้ใช้งาน
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{mockUsers.length} คน • {mockUsers.filter(u => u.status === 'active').length} Active</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Admin', count: mockUsers.filter(u => u.role === 'admin').length, icon: Shield, color: '#2563eb' },
            { label: 'Users', count: mockUsers.filter(u => u.role === 'user').length, icon: UserCheck, color: '#8b5cf6' },
            { label: 'Guests', count: mockUsers.filter(u => u.role === 'guest').length, icon: UserX, color: '#6b7280' },
          ].map(s => (
            <div key={s.label} className="metal-panel rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center border" style={{ background: `${s.color}15`, borderColor: `${s.color}25` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-chrome">{s.count}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="metal-panel rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">ชื่อ</th>
                <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">อีเมล</th>
                <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">บทบาท</th>
                <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">รายงาน</th>
                <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">ใช้งานล่าสุด</th>
                <th className="text-left text-[11px] text-slate-500 uppercase px-5 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {mockUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center border border-blue-500/15 text-xs text-blue-400 font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-chrome">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 flex items-center gap-1">
                    {u.email ? <><Mail className="w-3 h-3" />{u.email}</> : <span className="text-slate-600">ไม่มี</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-blue-500/15 text-blue-400' :
                      u.role === 'user' ? 'bg-purple-500/15 text-purple-400' :
                      'bg-slate-600/15 text-slate-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-orange-400 font-medium">{u.reports}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{u.lastActive}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full ${
                      u.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-600/15 text-slate-500'
                    }`}>
                      {u.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
