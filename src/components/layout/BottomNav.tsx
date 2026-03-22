'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Map, AlertTriangle, Fuel, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Map, label: 'แผนที่' },
  { href: '/report', icon: AlertTriangle, label: 'แจ้งเหตุ' },
  { href: '/stations', icon: Fuel, label: 'ปั๊มน้ำมัน' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 chrome-bar-bottom">
      {/* Top edge highlight */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />

      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-orange-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {/* Active indicator - glowing bg */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-orange-500/10 to-transparent border border-orange-500/15 shadow-inner" />
              )}

              <div className="relative">
                <item.icon className={cn(
                  'w-5 h-5 relative z-10',
                  isActive && 'drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]'
                )} />
                {/* Glow under icon */}
                {isActive && (
                  <div className="absolute -inset-1 bg-orange-500/20 rounded-full blur-md" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium relative z-10',
                isActive && 'text-orange-300'
              )}>
                {item.label}
              </span>

              {/* Bottom line indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 shadow-sm shadow-orange-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
