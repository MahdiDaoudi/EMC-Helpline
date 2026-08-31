import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";
import { LoginBody, ResetPasswordBody } from "./auth.schema";

export async function login(
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request<{}, {}, ResetPasswordBody>,
  res: Response,
) {
  await authService.resetPassword(req.body.email);
  res.status(200).json({
    message: "Un nouveau mot de passe a été envoyé par email.",
  });
}
