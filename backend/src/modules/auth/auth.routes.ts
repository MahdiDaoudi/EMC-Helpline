import { Router, Request, Response } from "express";
import { login ,resetPassword } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema, resetPasswordSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema) ,login);
authRouter.post("/reset-password", validate(resetPasswordSchema) ,resetPassword);
