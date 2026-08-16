import { Router } from "express";
import * as profileController from "./profile.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { changePasswordSchema, profileUpdateSchema } from "./profile.schema";

export const profileRouter = Router();

profileRouter.use(authenticate());
profileRouter.get("/", profileController.getProfile);
profileRouter.patch(
  "/",
  validate(profileUpdateSchema),
  profileController.updateProfile,
);
profileRouter.patch(
  "/password",
  validate(changePasswordSchema),
  profileController.changePassword,
);
