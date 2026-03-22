'use client';

import { Shield, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-orange-500" />
          <h1 className="text-lg font-bold text-white">ThaiHelp</h1>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border-2 border-orange-500"
                />
              )}
              <button
                onClick={signOut}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
