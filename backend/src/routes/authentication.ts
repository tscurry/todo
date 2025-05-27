import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../database/db';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from 'pg';
import { User } from '../utils/types';

const router = express.Router();

const saltRounds = 10;

// for testing
router.get('/session', (req, res) => {
  if (!req.session.user_uid) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  res.status(201).json({ user_uid: req.session.user_uid });
});

router.get('/status', (req, res) => {
  if (req.session && req.session.user_uid) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

router.get('/user', async (req, res) => {
  const user_uid = req.session.user_uid;

  let user: QueryResult<User>;

  try {
    user = await pool.query('SELECT * FROM users WHERE user_uid = $1;', [user_uid]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    res.status(200).json({ username: user.rows[0].username });
  } catch (error) {
    res.status(500).json({ error: 'failure to get user' });
  }
});

router.post('/signup', async (req, res) => {
  const { username, password, temp_uid } = req.body;
  const user_uid = uuidv4();

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const response = await pool.query('SELECT * FROM users WHERE username = $1;', [username]);

    if (response.rows.length) return res.status(409).json({ error: 'user already exists' });

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
    res.status(500).json({ error: 'error signing up' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await pool.query('SELECT * FROM users WHERE username = $1;', [username]);

    if (response.rows.length === 0)
      return res.status(401).json({ userError: 'user does not exist.' });

    const user = response.rows[0];
    const passwordsMatch = await bcrypt.compare(password, user.hashed_password);

    if (!passwordsMatch) return res.status(401).json({ passwordError: 'incorrect password' });

    if (typeof req.session.user_uid === 'undefined' || req.session.user_uid !== user.user_uid) {
      req.session.user_uid = user.user_uid;
    }

    // req.session.user_uid = user.user_uid;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      res.status(200).json({
        message: 'successful login',
        username: user.username,
        id: user.user_uid,
      });
    });

    res
      .status(200)
      .json({ message: 'successful login', username: user.username, id: user.user_uid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error trying to login' });
  }
});

router.post('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'error logging out' });
    res.clearCookie('session_id');
    res.status(200).json('logged out');
  });
});

export default router;
