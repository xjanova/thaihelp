'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield, LogOut, BarChart3, FileText, AlertTriangle,
  Users, Settings, ExternalLink, Fuel, ChevronRight, Menu, X
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/reports', icon: FileText, label: 'รายงานปั๊ม' },
  { href: '/admin/incidents', icon: AlertTriangle, label: 'เหตุการณ์' },
  { href: '/admin/users', icon: Users, label: 'ผู้ใช้งาน' },
  { href: '/admin/settings', icon: Settings, label: 'ตั้งค่า' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check auth
    fetch('/api/admin/stats').then(res => {
      if (res.status === 401) router.push('/admin/login');
      else setChecking(false);
    }).catch(() => router.push('/admin/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060a14' }}>
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(180deg, #040810, #0a1020)' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full metal-panel border-r border-slate-700/30 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="ThaiHelp" width={36} height={36} />
              <div>
                <h1 className="text-sm font-bold">
                  <span className="text-blue-400">Thai</span><span className="text-orange-400">Help</span>
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                    isActive
                      ? 'metal-btn-blue text-white font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}>
                  <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800/50 space-y-1">
            <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-blue-400 transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span>ดูเว็บหน้าบ้าน</span>
            </a>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="chrome-bar sticky top-0 z-30 h-14 flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden metal-btn p-2 rounded-lg text-slate-400 mr-3">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-medium text-chrome">
            {navItems.find(n => n.href === pathname)?.label || 'Admin'}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 metal-btn px-2 py-1 rounded-lg">● Online</span>
          </div>
        </header>
        <div className="h-[1px] bg-gradient-to-r from-blue-500/15 via-orange-500/10 to-transparent" />

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
