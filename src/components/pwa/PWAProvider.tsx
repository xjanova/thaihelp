'use client';

import { useEffect, useState } from 'react';
import { Download, X, Wifi, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] SW registration failed:', err);
        });
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 5 seconds
      setTimeout(() => setShowBanner(true), 5000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Online/offline detection
    const goOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };
    const goOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log('[PWA] Install:', outcome);
    setInstallPrompt(null);
    setShowBanner(false);
  };

  return (
    <>
      {children}

      {/* Install Banner */}
      {showBanner && installPrompt && (
        <div className="fixed top-16 left-4 right-4 z-[60] max-w-lg mx-auto animate-in slide-in-from-top-2 fade-in">
          <div className="metal-panel rounded-2xl p-4 flex items-center gap-3 border-cyan-500/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <Download className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-chrome">ติดตั้ง ThaiHelp</p>
              <p className="text-xs text-slate-500 mt-0.5">ใช้งานได้เหมือนแอปจริง แม้ไม่มีเน็ต</p>
            </div>
            <button
              onClick={handleInstall}
              className="metal-btn-accent px-4 py-2 rounded-lg text-xs font-bold text-white shrink-0"
            >
              ติดตั้ง
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1.5 text-slate-600 hover:text-slate-400 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Offline Toast */}
      {showOfflineToast && (
        <div className="fixed top-16 left-4 right-4 z-[60] max-w-lg mx-auto animate-in slide-in-from-top-2 fade-in">
          <div className="metal-panel rounded-2xl p-3 flex items-center gap-3 border-red-500/15">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center border border-red-500/20 shrink-0">
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm text-red-300 flex-1">ไม่มีสัญญาณอินเทอร์เน็ต — ใช้ข้อมูลที่ cache ไว้</p>
            <button
              onClick={() => setShowOfflineToast(false)}
              className="p-1 text-slate-600 hover:text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Online restored toast */}
      {isOnline && !showOfflineToast && (
        <div id="online-indicator" className="hidden" />
      )}
    </>
  );
}
