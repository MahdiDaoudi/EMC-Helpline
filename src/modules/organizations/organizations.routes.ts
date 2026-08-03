import { Router } from "express";
import * as organizationsController from "./organizations.controller";
import { validate } from "../../middleware/validate";
import {
    createOrganizationSchema,
    updateOrganizationSchema,
} from "./organizations.schema";

const organizationsRouter = Router();

organizationsRouter.get("/", organizationsController.getOrganizations);
organizationsRouter.get("/:id", organizationsController.getOrganization);
organizationsRouter.post("/", validate(createOrganizationSchema), organizationsController.createOrganization);
organizationsRouter.patch("/:id", validate(updateOrganizationSchema), organizationsController.updateOrganization);
organizationsRouter.delete("/:id", organizationsController.deleteOrganization);

export { organizationsRouter };