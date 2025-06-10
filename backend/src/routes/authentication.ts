import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../database/db';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from 'pg';
import { User } from '../utils/types';
import { authenticateRefreshToken, authenticateToken } from '../middleware/token.middleware';
import {
  generateRefreshToken,
  generateToken,
  refreshTokenCookieOptions,
} from '../helpers/token.helper';

const router = express.Router();
const saltRounds = 10;

router.get('/user', authenticateToken, async (req, res) => {
  let user: QueryResult<User>;

  try {
    user = await pool.query('SELECT * FROM users WHERE user_uid = $1;', [req.user.user_uid]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }

    res.status(200).json({
      isAuthenticated: true,
      user: {
        user_uid: user.rows[0].user_uid,
        username: user.rows[0].username,
      },
    });
  } catch (error) {
    console.error('Database error in /user route: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/signup', async (req, res) => {
  const { username, password, temp_uid } = req.body;
  const user_uid = uuidv4();

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const response = await pool.query('SELECT * FROM users WHERE username = $1;', [username]);

    if (response.rows.length) return res.status(409).json({ error: 'user already exists' });

    const newUser = await pool.query(
      'INSERT INTO users (user_uid, username, hashed_password) VALUES($1, $2, $3) RETURNING *;',
      [user_uid, username, hashedPassword],
    );

    if (temp_uid) {
      await pool.query(
        'UPDATE todos SET user_uid = $1, temp_uid = NULL WHERE temp_uid = $2 RETURNING *;',
        [user_uid, temp_uid],
      );
    }

    const token = generateToken(newUser.rows[0]);
    const refreshToken = generateRefreshToken(newUser.rows[0]);

    await pool.query(
      'INSERT INTO refresh_tokens (user_uid, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_uid) DO UPDATE SET token = $2, expires_at = $3;',
      [user_uid, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)],
    );

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        user_uid: newUser.rows[0].user_uid,
        username: newUser.rows[0].username,
      },
    });
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

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query(
      'INSERT INTO refresh_tokens (user_uid, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_uid) DO UPDATE SET token = $2, expires_at = $3;',
      [user.user_uid, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)],
    );

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      message: 'successful login',
      accessToken,
      username: user.username,
      id: user.user_uid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error trying to login' });
  }
});

router.post('/refresh', authenticateRefreshToken, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { user_uid } = req.user;

    const storedToken = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_uid = $1 AND token = $2 AND expires_at > NOW();',
      [user_uid, refreshToken],
    );

    // check if token is expiring; renew
    const currentExpiry = new Date(storedToken.rows[0]?.expires_at);
    const now = new Date();
    const shouldExtend = currentExpiry.getTime() - now.getTime() < 24 * 60 * 60 * 1000;

    if (storedToken.rows.length === 0) {
      await pool.query('DELETE FROM refresh_tokens WHERE user_uid = $1;', [user_uid]);
      res.clearCookie('refreshToken', { path: '/auth' });

      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await pool.query('SELECT * FROM users where user_uid = $1;', [user_uid]);

    if (user.rows.length === 0) {
      await pool.query('DELETE FROM refresh_tokens WHERE user_uid = $1;', [user_uid]);
      res.clearCookie('refreshToken', { path: '/auth' });

      return res.status(404).json({ error: 'User not found' });
    }

    const newAccessToken = generateToken(user.rows[0]);
    const newRefreshToken = generateRefreshToken(user.rows[0]);

    //update token but only extend expiration if close to expiring (<1d)
    await pool.query('UPDATE refresh_tokens SET token = $1, expires_at = $2 WHERE user_uid = $3;', [
      newRefreshToken,
      shouldExtend ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : currentExpiry,
      user.rows[0].user_uid,
    ]);

    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error refreshing token' });
  }
});

router.post('/logout', authenticateRefreshToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE user_uid = $1;', [req.user.user_uid]);
    res.clearCookie('refreshToken', { path: '/auth' });
    res.status(200).json({ message: 'logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during logout' });
  }
});

export default router;
