'use client';

import { Shield, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 chrome-bar">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-400/30">
              <Shield className="w-4.5 h-4.5 text-white drop-shadow-sm" />
            </div>
            {/* Metallic shine dot */}
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400/50" />
          </div>
          <div>
            <h1 className="text-base font-bold text-chrome">ThaiHelp</h1>
            <div className="h-[1px] w-full bg-gradient-to-r from-orange-500/60 to-transparent" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {user && (
            <>
              {user.photoURL && (
                <div className="relative">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-lg border border-slate-600 shadow-lg shadow-black/30"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-800" />
                </div>
              )}
              <button
                onClick={signOut}
                className="metal-btn p-2 rounded-lg text-slate-400 hover:text-orange-400"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
          <button className="metal-btn p-2 rounded-lg text-slate-400 hover:text-cyan-400">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Bottom edge highlight */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </header>
  );
}
