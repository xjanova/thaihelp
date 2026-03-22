'use client';

import { FlaskConical } from 'lucide-react';

interface DemoBannerProps {
  message?: string;
  compact?: boolean;
}

export function DemoBanner({ message = 'ข้อมูลตัวอย่าง (Demo) — ข้อมูลจริงจะแสดงเมื่อตั้งค่า API Keys', compact = false }: DemoBannerProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1">
        <FlaskConical className="w-3 h-3 text-yellow-500" />
        <span className="text-[10px] font-medium text-yellow-400 uppercase tracking-wider">Demo</span>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 bg-yellow-500/8 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center border border-yellow-500/20 shrink-0">
        <FlaskConical className="w-4 h-4 text-yellow-500" />
      </div>
      <div>
        <p className="text-xs font-medium text-yellow-400">ข้อมูลตัวอย่าง (Demo Mode)</p>
        <p className="text-[10px] text-yellow-500/60 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
