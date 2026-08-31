import { Router } from "express";
import * as profileController from "./profile.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { changePasswordSchema, profileUpdateSchema } from "./profile.schema";
import { upload } from "../../middleware/upload.middleware";

export const profileRouter = Router();

profileRouter.use(authenticate());

profileRouter.get("/", profileController.getProfile);

profileRouter.patch(
  "/",
  upload.single("image"),
  validate(profileUpdateSchema),
  profileController.updateProfile,
);

profileRouter.patch(
  "/password",
  validate(changePasswordSchema),
  profileController.changePassword,
);
