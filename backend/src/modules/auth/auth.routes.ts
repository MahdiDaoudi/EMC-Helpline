import { Router, Request, Response } from "express";
import { login } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema) ,login);
