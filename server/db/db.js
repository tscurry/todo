const { Pool } = require('pg');
const cron = require('node-cron');
require('dotenv').config();

const pool = new Pool({
  user: process.env.REACT_DB_USERNAME,
  password: process.env.REACT_DB_PASSWORD,
  host: process.env.REACT_SERVER_HOST,
  database: 'todosapp',
  port: process.env.REACT_DB_PORT,
});

// delete expired sessions from table
cron.schedule('*/1 * * * *', async () => {
  //change to every hour;
  await pool.query('DELETE FROM sessions WHERE expire < NOW();');
});

module.exports = pool;
