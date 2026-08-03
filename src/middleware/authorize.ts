import { NextFunction, Request, Response } from "express";
import { RoleName } from "../generated/prisma/enums";

export function authorize(...args: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!args.includes(req.user.role)) {
      return res.status(403).json({
        message: "Authorization denied",
      });
    }
    next();
  };
}
