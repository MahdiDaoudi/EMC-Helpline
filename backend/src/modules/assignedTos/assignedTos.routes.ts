import { Router } from "express";
import * as assignedTosController from "./assignedTos.controller";
import { validate } from "../../middleware/validate";
import {
  createAssignedToSchema,
  updateAssignedToSchema,
} from "./assignedTos.schema";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";

const assignedTosRouter = Router();

assignedTosRouter.use(authenticate());

assignedTosRouter.get("/", assignedTosController.getAssignedTos);
assignedTosRouter.get(
  "/:signalementId/:organizationId",
  assignedTosController.getAssignedTo,
);

assignedTosRouter.post(
  "/",
  authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.TECHNICIAN),
  validate(createAssignedToSchema),
  assignedTosController.createAssignedTo,
);

assignedTosRouter.patch(
  "/:signalementId/:organizationId",
  validate(updateAssignedToSchema),
  assignedTosController.updateAssignedTo,
);

assignedTosRouter.delete(
  "/:signalementId/:organizationId",
  authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.TECHNICIAN),
  assignedTosController.deleteAssignedTo,
);

export { assignedTosRouter };
