import jwt from "jsonwebtoken";
import { env } from '../config/env';

export interface VictimJwtPayload {
  victimId: number;
  referenceNumber: string;
  role: 'VICTIM';
}

export function generateAccessToken(userId: number, role: string, organizationId?: number | null) {
  return jwt.sign(
    {
      userId: userId,
      role: role,
      organizationId: organizationId ?? null,
    },
    env.secretKey,
    {
      expiresIn: "1d",
    }
  );
}

export function generateVictimToken(victimId: number, referenceNumber: string) {
  return jwt.sign(
    {
      victimId,
      referenceNumber,
      role: 'VICTIM',
    },
    env.secretKey,
    {
      expiresIn: "7d",
    }
  );
}