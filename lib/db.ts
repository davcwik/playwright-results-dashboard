import { Pool } from 'pg';

// Maintain a single connection pool across hot reloads in development
const globalForDb = global as unknown as { pool: Pool | undefined };

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// Helper utility to execute SQL queries
export async function query(text: string, params?: any[]) {
const start = Date.now();
  
  try {

    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;

  } catch (error: any) {

    const isServerDown = 
      error.code === 'ECONNREFUSED' || // Connection refused (Port closed / Postgres service stopped)
      error.code === 'ENOTFOUND'    || // Database host IP address not found
      error.code === '57P03'        || // Database server starting up / shutting down
      error.message?.includes('Connection terminated');

    if (isServerDown) {
      console.error(
        `[DATABASE ERROR] Unable to reach PostgreSQL server. Ensure your local PostgreSQL service is running.`
      );
      
    }

  }
}