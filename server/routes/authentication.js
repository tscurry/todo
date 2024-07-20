const express = require('express');
const pool = require('../db/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const saltRounds = 10;

router.post('/signup', async (req, res) => {
  const { username, password, temp_uid } = req.body;
  const user_uid = uuidv4();

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const response = await pool.query('SELECT * FROM users WHERE username = $1;', [username]);

    if (response.rows.length) return res.status(409).json('user already exists');

    await pool.query(
      'INSERT INTO users (user_uid, username, hashed_password) VALUES($1, $2, $3);',
      [user_uid, username, hashedPassword],
    );

    await pool.query(
      'UPDATE todos SET user_uid = $1, temp_uid = NULL WHERE temp_uid = $2 RETURNING *;',
      [user_uid, temp_uid],
    );

    res.status(201).json({ accountCreated: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error signing up' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await pool.query('SELECT * FROM users WHERE username = $1;', [username]);

    if (response.rows.length === 0) return res.status(401).json('user does not exist.');

    const user = response.rows[0];
    const passwordsMatch = await bcrypt.compare(password, user.hashed_password);

    if (!passwordsMatch) return res.status(401).json('incorrect password');

    if (typeof req.session.user_uid === 'undefined' || req.session.user_uid !== user.user_uid) {
      req.session.user_uid = user.user_uid;
    }
    res.status(200).json({ message: 'Successful login', user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error trying to login' });
  }
});

router.post('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'error logging out' });
    res.clearCookie('user_session');
    res.status(200).json('logged out');
  });
});

module.exports = router;
