import { Router } from "express";
import * as organizationsController from "./organizations.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "./organizations.schema";

const organizationsRouter = Router();

organizationsRouter.use(authenticate());
organizationsRouter.get(
  "/",
  authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN),
  organizationsController.getOrganizations,
);
organizationsRouter.get(
  "/:id",
  authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN),
  organizationsController.getOrganization,
);
import { upload } from "../../middleware/upload.middleware";

organizationsRouter.post(
  "/",
  authorize(RoleName.SUPER_ADMIN),
  upload.single("image"),
  validate(createOrganizationSchema),
  organizationsController.createOrganization,
);
organizationsRouter.patch(
  "/:id",
  authorize(RoleName.SUPER_ADMIN),
  upload.single("image"),
  validate(updateOrganizationSchema),
  organizationsController.updateOrganization,
);
organizationsRouter.delete(
  "/:id",
  authorize(RoleName.SUPER_ADMIN),
  organizationsController.deleteOrganization,
);

export { organizationsRouter };
