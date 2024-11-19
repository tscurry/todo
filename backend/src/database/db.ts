import { Pool } from 'pg';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.REACT_DB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  if (pool) {
    console.log('Database connected successfully');
  }
} catch (err) {
  console.error('Failed to connect to the database', err);
  process.exit(1);
}

export const cronSchedule = cron.schedule('0 */1 * * *', async () => {
  try {
    await pool.query('DELETE FROM sessions WHERE expire < NOW();');
    console.log('Expired sessions cleared');
  } catch (err) {
    console.error('Error clearing expired sessions', err);
  }
});

cronSchedule.start();

export default pool;
