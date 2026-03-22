'use client';

import { Settings, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 chrome-bar">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="ThaiHelp" width={36} height={36} className="drop-shadow-lg" />
          <div>
            <h1 className="text-base font-bold">
              <span className="text-blue-400">Thai</span><span className="text-orange-400">Help</span>
            </h1>
            <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/60 via-orange-500/40 to-transparent" />
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <span className="text-xs text-slate-400 mr-1 hidden sm:inline">{user.nickname}</span>
              <button onClick={logout} className="metal-btn p-2 rounded-lg text-slate-400 hover:text-orange-400" title="ออกจากระบบ">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className="metal-btn px-3 py-1.5 rounded-lg text-xs text-blue-400 flex items-center gap-1">
              <UserCircle className="w-4 h-4" />
              เข้าใช้งาน
            </Link>
          )}
          <button className="metal-btn p-2 rounded-lg text-slate-400 hover:text-blue-400">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-blue-500/20 via-orange-500/15 to-transparent" />
    </header>
  );
}
