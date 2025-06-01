import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token. Access Denied.' });
    req.user = user;
    next();
  });
};

export const authenticateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(404).json({ error: 'Refresh token required' });

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string,
    (err: VerifyErrors | null, user: string | JwtPayload | undefined) => {
      if (err)
        return res.status(403).json({ error: 'Invalid or expired refresh token. Access Denied.' });

      req.user = user;
      next();
    },
  );
};
