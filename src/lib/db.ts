import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getDb(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'admin_thaihelp',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'admin_thaihelp',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });
  }
  return pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(sql: string, params?: unknown[]): Promise<any[]> {
  const db = getDb();
  const [rows] = await db.query(sql, params);
  return rows as unknown[];
}

export async function execute(sql: string, params?: unknown[]): Promise<{ insertId: number; affectedRows: number }> {
  const db = getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result] = await db.query(sql, params) as any;
  return { insertId: result.insertId, affectedRows: result.affectedRows };
}
