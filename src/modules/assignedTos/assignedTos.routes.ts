import { Router } from "express";
import * as assignedTosController from "./assignedTos.controller";
import { validate } from "../../middleware/validate";
import {
    createAssignedToSchema,
    updateAssignedToSchema,
} from "./assignedTos.schema";

const assignedTosRouter = Router();

assignedTosRouter.get("/", assignedTosController.getAssignedTos);
assignedTosRouter.get("/:id", assignedTosController.getAssignedTo);
assignedTosRouter.post("/", validate(createAssignedToSchema), assignedTosController.createAssignedTo);
assignedTosRouter.patch("/:id", validate(updateAssignedToSchema), assignedTosController.updateAssignedTo);
assignedTosRouter.delete("/:id", assignedTosController.deleteAssignedTo);

export { assignedTosRouter };