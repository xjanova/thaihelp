'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Settings, Key, Map, Bot, Shield, Database, Globe, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const configSections = [
    {
      title: 'Google Maps API',
      icon: Map,
      color: '#22c55e',
      fields: [
        { key: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', label: 'Google Maps API Key', type: 'password', placeholder: 'AIzaSy...', hint: 'ต้องเปิด Maps JavaScript API + Places API' },
      ],
    },
    {
      title: 'Firebase Authentication',
      icon: Shield,
      color: '#f97316',
      fields: [
        { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', label: 'API Key', type: 'password', placeholder: 'AIzaSy...' },
        { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', label: 'Auth Domain', type: 'text', placeholder: 'project.firebaseapp.com' },
        { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', label: 'Project ID', type: 'text', placeholder: 'my-project-id' },
      ],
    },
    {
      title: 'Groq AI (Chat)',
      icon: Bot,
      color: '#8b5cf6',
      fields: [
        { key: 'GROQ_API_KEY', label: 'Groq API Key', type: 'password', placeholder: 'gsk_...', hint: 'สมัครฟรีที่ groq.com' },
      ],
    },
    {
      title: 'Database (MSSQL)',
      icon: Database,
      color: '#2563eb',
      fields: [
        { key: 'DB_HOST', label: 'Host', type: 'text', placeholder: 'localhost' },
        { key: 'DB_NAME', label: 'Database', type: 'text', placeholder: 'admin_thaihelp' },
        { key: 'DB_USER', label: 'Username', type: 'text', placeholder: 'admin_thaihelp' },
        { key: 'DB_PASSWORD', label: 'Password', type: 'password', placeholder: '••••••••' },
        { key: 'DB_PORT', label: 'Port', type: 'text', placeholder: '1433' },
      ],
    },
    {
      title: 'Admin Credentials',
      icon: Key,
      color: '#ef4444',
      fields: [
        { key: 'ADMIN_USERNAME', label: 'Username', type: 'text', placeholder: 'admin' },
        { key: 'ADMIN_PASSWORD', label: 'Password', type: 'password', placeholder: '••••••••', hint: 'เปลี่ยนรหัสผ่านที่นี่' },
      ],
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-chrome flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" /> ตั้งค่าระบบ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">จัดการ API Keys และการตั้งค่าต่างๆ</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="metal-panel rounded-xl p-4 border-blue-500/10">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-chrome font-medium">การตั้งค่า Environment Variables</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ค่าเหล่านี้ต้องแก้ไขในไฟล์ <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">.env.local</code> บน server
                แล้ว restart PM2 ด้วย <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">pm2 restart thaihelp</code>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ไฟล์: <code className="text-orange-400">/home/admin/domains/thaihelp.xman4289.com/app/.env.local</code>
              </p>
            </div>
          </div>
        </div>

        {/* Config Sections */}
        {configSections.map((section) => (
          <div key={section.title} className="metal-panel rounded-2xl overflow-hidden">
            <div className="p-5 pb-3 flex items-center gap-2 border-b border-slate-800/30">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: `${section.color}15`, borderColor: `${section.color}25` }}>
                <section.icon className="w-4 h-4" style={{ color: section.color }} />
              </div>
              <h2 className="text-sm font-bold text-chrome">{section.title}</h2>
            </div>
            <div className="p-5 space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded shrink-0">{field.key}</code>
                    <input type={field.type} placeholder={field.placeholder}
                      className="flex-1 metal-input rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none" disabled />
                  </div>
                  {field.hint && <p className="text-[10px] text-slate-600 mt-1">{field.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* SSH Commands */}
        <div className="metal-panel rounded-2xl p-5">
          <h3 className="text-sm font-bold text-chrome mb-3">⌨️ คำสั่ง SSH</h3>
          <div className="space-y-2">
            {[
              { label: 'แก้ไข .env.local', cmd: 'nano /home/admin/domains/thaihelp.xman4289.com/app/.env.local' },
              { label: 'Restart app', cmd: 'pm2 restart thaihelp' },
              { label: 'ดู logs', cmd: 'pm2 logs thaihelp --lines 50' },
              { label: 'สถานะ app', cmd: 'pm2 status' },
              { label: 'Deploy ใหม่', cmd: 'cd /home/admin/domains/thaihelp.xman4289.com/repo && git pull && bash scripts/deploy.sh' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-slate-900/40 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-500 shrink-0 w-28">{item.label}:</span>
                <code className="text-xs text-cyan-400 font-mono flex-1 truncate">{item.cmd}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
