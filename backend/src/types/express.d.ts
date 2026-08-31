import { JwtPayload, VictimJwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      victim?: VictimJwtPayload;
    }
  }
}

export {};