import { Pool } from 'pg';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

try {
  if (pool) {
    console.log('Database connected successfully');
  }
} catch (err) {
  console.error('Failed to connect to the database', err);
  process.exit(1);
}

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW();');
    console.log('Database connected successfully:', res.rows[0]);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

testConnection();

export const cronSchedule = cron.schedule('0 */1 * * *', async () => {
  try {
    const result = await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    console.log(`Expired refresh tokens cleared: ${result.rowCount} tokens removed`);
  } catch (err) {
    console.error('Error clearing expired refresh tokens:', err);
  }
});

cronSchedule.start();

export default pool;
