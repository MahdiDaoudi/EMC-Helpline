import { Router } from "express";
import * as platformsController from "./platforms.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";
import { createPlatformSchema, updatePlatformSchema } from "./platforms.schema";
import { upload } from "../../middleware/upload.middleware";

const platformsRouter = Router();

platformsRouter.use(authenticate());
platformsRouter.get(
  "/",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TECHNICIAN),
  platformsController.getPlatforms,
);
platformsRouter.get(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TECHNICIAN),
  platformsController.getPlatform,
);
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
