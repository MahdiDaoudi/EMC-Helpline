import { Router } from "express";
import * as cyberViolencesController from "./cyberViolences.controller";
import { validate } from "../../middleware/validate";
import {
    createCyberViolenceSchema,
    updateCyberViolenceSchema,
} from "./cyberViolences.schema";

const cyberViolencesRouter = Router();

cyberViolencesRouter.get("/", cyberViolencesController.getCyberViolences);
cyberViolencesRouter.get("/:id", cyberViolencesController.getCyberViolence);
cyberViolencesRouter.post("/", validate(createCyberViolenceSchema), cyberViolencesController.createCyberViolence);
cyberViolencesRouter.patch("/:id", validate(updateCyberViolenceSchema), cyberViolencesController.updateCyberViolence);
cyberViolencesRouter.delete("/:id", cyberViolencesController.deleteCyberViolence);

export { cyberViolencesRouter };