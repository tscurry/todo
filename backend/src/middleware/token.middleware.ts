import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { User } from '../utils/types';

interface TokenUser {
  user_uid: string;
  username: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTokenUser(payload: any): payload is TokenUser {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.user_uid === 'string' &&
    typeof payload.username === 'string'
  );
}

//for authenticated and unauthenticated users
export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = undefined;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, payload) => {
    if (err || !isTokenUser(payload)) {
      req.user = undefined;
    } else {
      req.user = payload as User;
    }
    next();
  });
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, payload) => {
    if (err || !isTokenUser(payload)) {
      return res.status(403).json({ error: 'Invalid or expired token. Access Denied.' });
    }
    req.user = payload as User;
    next();
  });
};

export const authenticateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) return res.status(404).json({ error: 'Refresh token required' });

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string,
    (err: VerifyErrors | null, payload: string | JwtPayload | undefined) => {
      if (err || !isTokenUser(payload)) {
        return res.status(403).json({ error: 'Invalid or expired refresh token. Access Denied.' });
      }
      req.user = payload as User;
      next();
    },
  );
};
