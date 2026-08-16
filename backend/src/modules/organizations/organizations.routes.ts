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
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TECHNICIAN),
  organizationsController.getOrganizations,
);
organizationsRouter.get(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TECHNICIAN),
  organizationsController.getOrganization,
);
organizationsRouter.post(
  "/",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  validate(createOrganizationSchema),
  organizationsController.createOrganization,
);
organizationsRouter.patch(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  validate(updateOrganizationSchema),
  organizationsController.updateOrganization,
);
organizationsRouter.delete(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  organizationsController.deleteOrganization,
);

export { organizationsRouter };
