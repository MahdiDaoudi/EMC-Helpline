import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";
import { LoginBody } from "./auth.schema";

export async function login(
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
