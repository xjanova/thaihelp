'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Settings, Key, Map, Bot, Shield, Database, Globe, Save, CheckCircle2, RefreshCw, Zap, LucideIcon } from 'lucide-react';

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  hint?: string;
  envOnly?: boolean;
}

interface ConfigSection {
  title: string;
  icon: LucideIcon;
  color: string;
  fields: ConfigField[];
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [dbStatus, setDbStatus] = useState<{ isComplete: boolean; tables: string[]; missingTables: string[] } | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
    checkDbStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data || {});
        if (data.dbMissing) setError('ตาราง site_settings ยังไม่ถูกสร้าง — กรุณาสร้างตาราง DB ก่อน');
      } else {
        setError(data.error || 'ไม่สามารถโหลดการตั้งค่าได้');
      }
    } catch (e) {
      setError('ไม่สามารถเชื่อมต่อ API ได้: ' + String(e));
    }
    finally { setLoading(false); }
  };

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/db/setup');
      if (res.status === 401) {
        setDbStatus({ isComplete: false, tables: [], missingTables: ['ต้องล็อกอินก่อน'] });
        return;
      }
      const data = await res.json();
      setDbStatus(data);
    } catch {
      setDbStatus({ isComplete: false, tables: [], missingTables: ['เชื่อมต่อไม่ได้'] });
    }
  };

  const handleSetupDb = async () => {
    setSetupLoading(true);
    try {
      const res = await fetch('/api/db/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await checkDbStatus();
      }
    } catch { /* ignore */ }
    finally { setSetupLoading(false); }
  };

  const handleSaveSettings = async (key: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { [key]: value } }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const configSections: ConfigSection[] = [
    {
      title: 'Google Maps API',
      icon: Map,
      color: '#22c55e',
      fields: [
        { key: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', label: 'Google Maps API Key', type: 'password', placeholder: 'AIzaSy...', hint: 'ต้องเปิด Maps JavaScript API + Places API', envOnly: true },
      ],
    },
    {
      title: 'Firebase Authentication',
      icon: Shield,
      color: '#f97316',
      fields: [
        { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', label: 'API Key', type: 'password', placeholder: 'AIzaSy...', envOnly: true },
        { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', label: 'Auth Domain', type: 'text', placeholder: 'project.firebaseapp.com', envOnly: true },
        { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', label: 'Project ID', type: 'text', placeholder: 'my-project-id', envOnly: true },
      ],
    },
    {
      title: 'Groq AI (น้องหญิง)',
      icon: Bot,
      color: '#8b5cf6',
      fields: [
        { key: 'GROQ_API_KEY', label: 'Groq API Key', type: 'password', placeholder: 'gsk_...', hint: 'สมัครฟรีที่ groq.com', envOnly: true },
      ],
    },
    {
      title: 'Database (MySQL / MariaDB)',
      icon: Database,
      color: '#2563eb',
      fields: [
        { key: 'DB_HOST', label: 'Host', type: 'text', placeholder: 'localhost', envOnly: true },
        { key: 'DB_NAME', label: 'Database', type: 'text', placeholder: 'admin_thaihelp', envOnly: true },
        { key: 'DB_USER', label: 'Username', type: 'text', placeholder: 'admin_thaihelp', envOnly: true },
        { key: 'DB_PASSWORD', label: 'Password', type: 'password', placeholder: '••••••••', envOnly: true },
        { key: 'DB_PORT', label: 'Port', type: 'text', placeholder: '3306', envOnly: true },
      ],
    },
    {
      title: 'Admin Credentials',
      icon: Key,
      color: '#ef4444',
      fields: [
        { key: 'ADMIN_USERNAME', label: 'Username', type: 'text', placeholder: 'admin', envOnly: true },
        { key: 'ADMIN_PASSWORD', label: 'Password', type: 'password', placeholder: '••••••••', hint: 'เปลี่ยนรหัสผ่านใน .env.local', envOnly: true },
      ],
    },
  ];

  const featureSettings = [
    { key: 'site_name', label: 'ชื่อเว็บไซต์', placeholder: 'ThaiHelp' },
    { key: 'site_description', label: 'คำอธิบาย', placeholder: 'ชุมชนช่วยเหลือนักเดินทาง' },
    { key: 'incident_expire_hours', label: 'เหตุการณ์หมดอายุ (ชม.)', placeholder: '4' },
    { key: 'report_expire_hours', label: 'รายงานปั๊มหมดอายุ (ชม.)', placeholder: '6' },
    { key: 'default_map_lat', label: 'แผนที่ Lat เริ่มต้น', placeholder: '13.7563' },
    { key: 'default_map_lng', label: 'แผนที่ Lng เริ่มต้น', placeholder: '100.5018' },
    { key: 'default_map_zoom', label: 'แผนที่ Zoom เริ่มต้น', placeholder: '12' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-chrome flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" /> ตั้งค่าระบบ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">จัดการ API Keys, ฐานข้อมูล และการตั้งค่าต่างๆ</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> บันทึกแล้ว
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Database Status */}
        <div className="metal-panel rounded-2xl overflow-hidden">
          <div className="p-5 pb-3 flex items-center gap-2 border-b border-slate-800/30">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-cyan-500/10 border-cyan-500/25">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-sm font-bold text-chrome">สถานะฐานข้อมูล</h2>
          </div>
          <div className="p-5">
            {dbStatus ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${dbStatus.isComplete ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`} />
                  <span className="text-sm text-chrome">
                    {dbStatus.isComplete ? 'ฐานข้อมูลพร้อมใช้งาน' : `ขาด ${dbStatus.missingTables.length} ตาราง`}
                  </span>
                </div>
                {dbStatus.tables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dbStatus.tables.map((t) => (
                      <span key={t} className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">{t}</span>
                    ))}
                  </div>
                )}
                {dbStatus.missingTables.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {dbStatus.missingTables.map((t) => (
                        <span key={t} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">❌ {t}</span>
                      ))}
                    </div>
                    <button onClick={handleSetupDb} disabled={setupLoading}
                      className="metal-btn px-4 py-2 rounded-lg text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 mt-2">
                      {setupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      {setupLoading ? 'กำลังสร้างตาราง...' : 'สร้างตารางที่ขาด'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">กำลังตรวจสอบ...</p>
            )}
          </div>
        </div>

        {/* Site Settings (editable via DB) */}
        <div className="metal-panel rounded-2xl overflow-hidden">
          <div className="p-5 pb-3 flex items-center gap-2 border-b border-slate-800/30">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-orange-500/10 border-orange-500/25">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="text-sm font-bold text-chrome">ตั้งค่าเว็บไซต์</h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">แก้ไขได้ทันที</span>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <p className="text-xs text-slate-500">กำลังโหลด...</p>
            ) : (
              featureSettings.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settings[field.key] || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="flex-1 metal-input rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                    />
                    <button
                      onClick={() => handleSaveSettings(field.key, settings[field.key] || '')}
                      disabled={saving}
                      className="metal-btn px-3 py-2 rounded-lg text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info banner */}
        <div className="metal-panel rounded-xl p-4 border-blue-500/10">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-chrome font-medium">Environment Variables (ต้องแก้ไขบน server)</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ค่า API Keys ต้องแก้ไขในไฟล์ <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">.env.local</code> บน server
                แล้ว restart PM2 ด้วย <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">pm2 restart thaihelp</code>
              </p>
            </div>
          </div>
        </div>

        {/* Config Sections (env-only) */}
        {configSections.map((section) => (
          <div key={section.title} className="metal-panel rounded-2xl overflow-hidden">
            <div className="p-5 pb-3 flex items-center gap-2 border-b border-slate-800/30">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: `${section.color}15`, borderColor: `${section.color}25` }}>
                <section.icon className="w-4 h-4" style={{ color: section.color }} />
              </div>
              <h2 className="text-sm font-bold text-chrome">{section.title}</h2>
              <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full ml-auto">.env.local</span>
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
          <h3 className="text-sm font-bold text-chrome mb-3">คำสั่ง SSH</h3>
          <div className="space-y-2">
            {[
              { label: 'แก้ไข .env.local', cmd: 'nano /home/admin/domains/thaihelp.xman4289.com/app/.env.local' },
              { label: 'Restart app', cmd: 'pm2 restart thaihelp' },
              { label: 'ดู logs', cmd: 'pm2 logs thaihelp --lines 50' },
              { label: 'สถานะ app', cmd: 'pm2 status' },
              { label: 'Setup DB', cmd: 'curl -X POST https://thaihelp.xman4289.com/api/db/setup' },
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
