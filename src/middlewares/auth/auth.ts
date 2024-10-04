import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../utils/env';

export const authenticate = (req: Request, res: Response, next: NextFunction):void => {
  const token = req.headers['authorization']?.split(' ')[1]; 

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
