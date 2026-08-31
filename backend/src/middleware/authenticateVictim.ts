import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { VictimJwtPayload } from '../utils/jwt';

export function authenticateVictim() {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Accès non autorisé. Token de suivi manquant.',
      });
    }

    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, env.secretKey) as VictimJwtPayload;
      if (!payload || !payload.victimId || payload.role !== 'VICTIM') {
        return res.status(401).json({
          message: 'Token de suivi invalide.',
        });
      }

      req.victim = payload;
      next();
    } catch {
      return res.status(401).json({
        message: 'Session de suivi expirée ou invalide.',
      });
    }
  };
}
