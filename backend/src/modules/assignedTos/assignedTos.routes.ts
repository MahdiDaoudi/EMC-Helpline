import { Router } from "express";
import * as assignedTosController from "./assignedTos.controller";
import { validate } from "../../middleware/validate";
import {
  createAssignedToSchema,
  updateAssignedToSchema,
} from "./assignedTos.schema";

const assignedTosRouter = Router();

assignedTosRouter.get("/", assignedTosController.getAssignedTos);
assignedTosRouter.get(
  "/:signalementId/:organizationId",
  assignedTosController.getAssignedTo,
);

assignedTosRouter.post(
  "/",
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
  assignedTosController.deleteAssignedTo,
);

export { assignedTosRouter };
