import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'admin_thaihelp',
  user: process.env.DB_USER || 'admin_thaihelp',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export async function query<T>(
  queryString: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const db = await getDb();
  const request = db.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  const result = await request.query(queryString);
  return result.recordset as T[];
}

export async function execute(
  queryString: string,
  params?: Record<string, unknown>
): Promise<sql.IResult<unknown>> {
  const db = await getDb();
  const request = db.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  return request.query(queryString);
}

export { sql };
