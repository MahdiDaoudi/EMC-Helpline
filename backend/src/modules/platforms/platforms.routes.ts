import { Router } from "express";
import * as platformsController from "./platforms.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";
import { createPlatformSchema, updatePlatformSchema } from "./platforms.schema";
import { upload } from "../../middleware/upload.middleware";

const platformsRouter = Router();

// Public GET routes accessible by forms and victim tracking
platformsRouter.get("/", platformsController.getPlatforms);
platformsRouter.get("/:id", platformsController.getPlatform);

// Protected routes for managing platforms
platformsRouter.use(authenticate());

platformsRouter.post(
  "/",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  upload.single("icon"),
  validate(createPlatformSchema),
  platformsController.createPlatform,
);
platformsRouter.patch(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  upload.single("icon"),
  validate(updatePlatformSchema),
  platformsController.updatePlatform,
);
platformsRouter.delete(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  platformsController.deletePlatform,
);

export { platformsRouter };
