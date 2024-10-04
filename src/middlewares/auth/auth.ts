// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret in production

export const authenticate = (req: Request, res: Response, next: NextFunction):void => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any) => {
    if (err) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    next();
  });
};
