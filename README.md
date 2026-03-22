<p align="center">
  <img src="public/icons/icon-192.png" width="80" alt="ThaiHelp Logo" />
</p>

<h1 align="center">ThaiHelp</h1>

<p align="center">
  <strong>ชุมชนช่วยเหลือนักเดินทาง</strong><br/>
  แจ้งเหตุบนถนน | รายงานปั๊มน้ำมัน | สั่งงานด้วยเสียง AI
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-8-4479a1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PWA-Ready-f97316?logo=pwa" alt="PWA" />
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **แจ้งเหตุบนถนน** | รายงานอุบัติเหตุ, น้ำท่วม, จุดตรวจ, การก่อสร้าง พร้อมระบุตำแหน่งบนแผนที่ |
| **รายงานปั๊มน้ำมัน** | เช็คสถานะน้ำมัน 9 ประเภท (แก๊สโซฮอล์ 95/91, E20, E85, ดีเซล, NGV, LPG ฯลฯ) |
| **น้องหญิง AI** | ผู้ช่วยเสียง AI พร้อม lip-sync animation — สั่งงานด้วยเสียงภาษาไทย (Groq) |
| **แผนที่ Google Maps** | แสดงเหตุการณ์และปั๊มน้ำมันแบบ real-time บนแผนที่ |
| **PWA** | ติดตั้งบนมือถือได้เหมือนแอป, ใช้งานออฟไลน์ได้ |
| **Admin Panel** | Dashboard, จัดการรายงาน, จัดการเหตุการณ์, ตั้งค่าระบบ |
| **First-time Setup** | Wizard ตั้งค่าระบบครั้งแรก สร้างฐานข้อมูลอัตโนมัติ |

---

## Tech Stack

```
Frontend:   Next.js 14 (App Router) + React 18 + TypeScript
Styling:    Tailwind CSS + Custom Metal Theme
Database:   MySQL 8+ / MariaDB (mysql2)
AI:         Groq SDK (Whisper + Llama) — น้องหญิง voice assistant
Maps:       Google Maps JavaScript API + Places API
Auth:       Token-based admin auth + Rate limiting
Deploy:     PM2 + Standalone build
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **MySQL 8+** or **MariaDB 10.6+**
- **Google Maps API Key** (Maps JavaScript API + Places API)
- **Groq API Key** (ฟรี — [groq.com](https://groq.com))

### 1. Clone & Install

```bash
git clone https://github.com/xman4289/thaihelp.git
cd thaihelp
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

แก้ไขไฟล์ `.env.local`:

```env
# === MySQL ===
DB_HOST=localhost
DB_PORT=3306
DB_NAME=admin_thaihelp
DB_USER=admin_thaihelp
DB_PASSWORD=your_password_here

# === Google Maps ===
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# === Groq AI (น้องหญิง) ===
GROQ_API_KEY=gsk_...

# === Admin ===
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword!
ADMIN_SECRET=your-secret-key

# === App ===
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=ThaiHelp
```

### 3. Setup Database

```bash
# สร้าง database
mysql -u root -p -e "CREATE DATABASE admin_thaihelp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# สร้าง user
mysql -u root -p -e "CREATE USER 'admin_thaihelp'@'localhost' IDENTIFIED BY 'your_password'; GRANT ALL PRIVILEGES ON admin_thaihelp.* TO 'admin_thaihelp'@'localhost'; FLUSH PRIVILEGES;"
```

### 4. Run Development

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### 5. First-time Admin Setup

1. เปิด `/admin/login` → ล็อกอินด้วย admin credentials
2. ไปที่ `/admin/setup` → ระบบจะตรวจสอบและสร้างตารางอัตโนมัติ
3. ตั้งค่าชื่อเว็บ, พิกัดแผนที่เริ่มต้น
4. เสร็จสิ้น → ไป Dashboard

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # หน้าหลัก — แผนที่ + น้องหญิง
│   ├── chat/page.tsx            # แชทกับน้องหญิง AI
│   ├── stations/page.tsx        # ค้นหาปั๊มน้ำมัน
│   ├── report/page.tsx          # รายงานปั๊มน้ำมัน
│   ├── login/page.tsx           # ล็อกอินผู้ใช้
│   ├── offline/page.tsx         # หน้า offline (PWA)
│   ├── admin/
│   │   ├── login/page.tsx       # ล็อกอินแอดมิน
│   │   ├── setup/page.tsx       # 🆕 First-time setup wizard
│   │   ├── dashboard/page.tsx   # Dashboard ภาพรวม
│   │   ├── reports/page.tsx     # จัดการรายงานปั๊ม
│   │   ├── incidents/page.tsx   # จัดการเหตุการณ์
│   │   ├── users/page.tsx       # จัดการผู้ใช้
│   │   └── settings/page.tsx    # ตั้งค่าระบบ
│   └── api/
│       ├── db/setup/route.ts    # สร้าง/ตรวจสอบตาราง DB
│       ├── incidents/route.ts   # CRUD เหตุการณ์
│       ├── stations/route.ts    # ค้นหา/รายงานปั๊ม
│       └── admin/               # Admin APIs (protected)
├── components/
│   ├── admin/                   # Admin UI components
│   ├── map/                     # Google Maps components
│   ├── pwa/                     # PWA provider + permission gate
│   ├── onboarding/              # Tutorial overlay
│   └── ui/                      # Shared UI components
├── lib/
│   ├── db.ts                    # MySQL connection pool
│   └── admin-auth.ts            # Admin authentication
└── types/
    └── index.ts                 # TypeScript definitions
```

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | ข้อมูลผู้ใช้ (nickname, email, avatar) |
| `incidents` | เหตุการณ์บนถนน (6 ประเภท, auto-expire 4 ชม.) |
| `incident_votes` | ระบบ upvote เหตุการณ์ (ป้องกัน duplicate) |
| `station_reports` | รายงานปั๊มน้ำมัน (เชื่อม Google Places) |
| `fuel_reports` | สถานะน้ำมันแต่ละประเภท (9 ชนิด, 4 สถานะ) |
| `site_settings` | ตั้งค่าเว็บไซต์ (key-value, แก้ไขผ่าน Admin) |
| `admin_logs` | บันทึกการทำงานของแอดมิน |

---

## Deployment (Production)

### Build

```bash
npm run build
```

### PM2 (Recommended)

```bash
# Start
pm2 start npm --name "thaihelp" -- start

# Restart
pm2 restart thaihelp

# Logs
pm2 logs thaihelp --lines 50

# Auto-start on reboot
pm2 save && pm2 startup
```

### Setup Database via API

```bash
curl -X POST https://your-domain.com/api/db/setup
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/db/setup` | ตรวจสอบสถานะ DB | - |
| `POST` | `/api/db/setup` | สร้างตาราง DB | - |
| `GET` | `/api/incidents` | ดึงเหตุการณ์ทั้งหมด | - |
| `POST` | `/api/incidents` | สร้างเหตุการณ์ใหม่ | - |
| `GET` | `/api/stations` | ค้นหาปั๊มน้ำมัน | - |
| `POST` | `/api/stations` | รายงานปั๊มน้ำมัน | - |
| `POST` | `/api/admin/login` | ล็อกอินแอดมิน | - |
| `POST` | `/api/admin/logout` | ล็อกเอาท์แอดมิน | - |
| `GET` | `/api/admin/stats` | สถิติ Dashboard | Admin |
| `GET` | `/api/admin/settings` | ดึงการตั้งค่า | Admin |
| `PUT` | `/api/admin/settings` | บันทึกการตั้งค่า | Admin |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Admin Login | 3 req/min per IP |
| Create Incident | 5 req/min per IP |
| Station Search | 20 req/min per IP |

---

## License

MIT

---

<p align="center">
  Made with ❤️ by <strong>XMAN Studio</strong><br/>
  <sub>Powered by Next.js, Groq AI, Google Maps</sub>
</p>
