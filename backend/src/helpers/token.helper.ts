import jwt from 'jsonwebtoken';
import { User } from '../utils/types';

export const generateToken = (user: User) => {
  return jwt.sign(
    { username: user.username, user_uid: user.user_uid },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '15m',
    },
  );
};

export const generateRefreshToken = (user: User) => {
  return jwt.sign({ user_uid: user.user_uid }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
  });
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/auth',
};
