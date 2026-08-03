import { Request, Response } from "express";
import * as authService from "./auth.service";
import { LoginBody, loginSchema } from "./auth.schema";

export async function login(req: Request<{}, {}, LoginBody>, res: Response) {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body.email, body.password);
  res.json(result);
}
