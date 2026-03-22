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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <item.icon className={cn('w-6 h-6', isActive && 'drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
