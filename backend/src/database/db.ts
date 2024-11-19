import { Pool } from 'pg';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.REACT_DB_USERNAME,
  password: process.env.REACT_DB_PASSWORD,
  host: process.env.REACT_SERVER_HOST,
  connectionString: process.env.REACT_DB_CONNECTION_STRING,
  database: process.env.REACT_DB,
  port: Number(process.env.REACT_DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

// delete expired sessions from table
export const cronSchedule = cron.schedule('*/1 * * * *', async () => {
  await pool.query('DELETE FROM sessions WHERE expire < NOW();');
});

cronSchedule.start();

export default pool;
