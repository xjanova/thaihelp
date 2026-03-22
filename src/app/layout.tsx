import type { Metadata, Viewport } from 'next';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { PermissionGate } from '@/components/pwa/PermissionGate';
import './globals.css';

export const metadata: Metadata = {
  title: 'ThaiHelp - ชุมชนช่วยเหลือนักเดินทาง',
  description: 'ชุมชนช่วยเหลือนักเดินทาง แจ้งเหตุ รายงานปั๊มน้ำมัน สั่งงานด้วยเสียง',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ThaiHelp',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f97316',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        <PWAProvider>
          <PermissionGate>
            {children}
          </PermissionGate>
        </PWAProvider>
      </body>
    </html>
  );
}
