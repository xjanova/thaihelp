'use client';

import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 chrome-bar">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="ThaiHelp" width={36} height={36} className="drop-shadow-lg" />
          <div>
            <h1 className="text-base font-bold">
              <span className="text-blue-400">Thai</span><span className="text-orange-400">Help</span>
            </h1>
            <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/60 via-orange-500/40 to-transparent" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {user && (
            <>
              {user.photoURL && (
                <div className="relative">
                  <img src={user.photoURL} alt={user.displayName}
                    className="w-8 h-8 rounded-lg border border-slate-600 shadow-lg shadow-black/30" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-800" />
                </div>
              )}
              <button onClick={signOut} className="metal-btn p-2 rounded-lg text-slate-400 hover:text-orange-400" title="ออกจากระบบ">
                <LogOut className="w-4 h-4" />
              </button>
            </>
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
