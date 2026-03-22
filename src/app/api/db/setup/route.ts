import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/admin-auth';

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_nickname (nickname)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category ENUM('accident','flood','roadblock','checkpoint','construction','other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    image_url VARCHAR(500),
    upvotes INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    INDEX idx_active (is_active, expires_at),
    INDEX idx_location (latitude, longitude),
    INDEX idx_category (category)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS station_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id VARCHAR(255) NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_email VARCHAR(255),
    note TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_place (place_id),
    INDEX idx_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS fuel_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    fuel_type ENUM('gasohol95','gasohol91','e20','e85','diesel','diesel_b7','premium_diesel','ngv','lpg') NOT NULL,
    status ENUM('available','low','empty','unknown') NOT NULL DEFAULT 'unknown',
    price DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report (report_id),
    INDEX idx_fuel_type (fuel_type),
    FOREIGN KEY (report_id) REFERENCES station_reports(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS incident_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    user_ip VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_vote (incident_id, user_ip),
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_group (setting_group)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    detail TEXT,
    admin_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const DEFAULT_SETTINGS = [
  { key: 'site_name', value: 'ThaiHelp', group: 'general' },
  { key: 'site_description', value: 'ชุมชนช่วยเหลือนักเดินทาง', group: 'general' },
  { key: 'setup_completed', value: 'false', group: 'system' },
  { key: 'incident_expire_hours', value: '4', group: 'incidents' },
  { key: 'report_expire_hours', value: '6', group: 'reports' },
  { key: 'max_upload_size_mb', value: '5', group: 'general' },
  { key: 'enable_voice_assistant', value: 'true', group: 'features' },
  { key: 'enable_incident_reports', value: 'true', group: 'features' },
  { key: 'enable_fuel_reports', value: 'true', group: 'features' },
  { key: 'default_map_lat', value: '13.7563', group: 'map' },
  { key: 'default_map_lng', value: '100.5018', group: 'map' },
  { key: 'default_map_zoom', value: '12', group: 'map' },
];

// GET — check setup status (requires admin auth)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tables = await query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0] as string);
    const requiredTables = ['users', 'incidents', 'station_reports', 'fuel_reports', 'incident_votes', 'site_settings', 'admin_logs'];
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t));

    let setupCompleted = false;
    if (tableNames.includes('site_settings')) {
      const rows = await query("SELECT setting_value FROM site_settings WHERE setting_key = 'setup_completed'");
      setupCompleted = rows.length > 0 && rows[0].setting_value === 'true';
    }

    return NextResponse.json({
      success: true,
      tables: tableNames,
      missingTables,
      isComplete: missingTables.length === 0,
      setupCompleted,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
      tables: [],
      missingTables: ['all'],
      isComplete: false,
      setupCompleted: false,
    });
  }
}

// POST — create tables (requires admin auth)
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    for (const sql of CREATE_TABLES) {
      await execute(sql);
    }

    // Insert default settings (ignore if already exist)
    for (const s of DEFAULT_SETTINGS) {
      await execute(
        `INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)`,
        [s.key, s.value, s.group]
      );
    }

    // Verify tables
    const tables = await query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: tableNames,
    });
  } catch (error) {
    console.error('DB setup error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
