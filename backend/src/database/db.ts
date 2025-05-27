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
    await pool.query(`DELETE FROM sessions WHERE expire < (NOW() - INTERVAL '1 hour')`);
    console.log('Expired sessions cleared');
  } catch (err) {
    console.error('Error clearing expired sessions', err);
  }
});

cronSchedule.start();

export default pool;
