import { Router } from "express";
import * as cyberViolencesController from "./cyberViolences.controller";
import { validate } from "../../middleware/validate";
import {
    createCyberViolenceSchema,
    updateCyberViolenceSchema,
} from "./cyberViolences.schema";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";

const cyberViolencesRouter = Router();

// Public GET routes accessible by forms and victim tracking
cyberViolencesRouter.get("/", cyberViolencesController.getCyberViolences);
cyberViolencesRouter.get("/:id", cyberViolencesController.getCyberViolence);

// Protected routes for managing cyberviolences
cyberViolencesRouter.use(authenticate());

cyberViolencesRouter.post(
  "/",
  authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN),
  validate(createCyberViolenceSchema),
  cyberViolencesController.createCyberViolence,
);
cyberViolencesRouter.patch(
  "/:id",
  authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN),
  validate(updateCyberViolenceSchema),
  cyberViolencesController.updateCyberViolence,
);
cyberViolencesRouter.delete(
  "/:id",
  authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN),
  cyberViolencesController.deleteCyberViolence,
);

export { cyberViolencesRouter };