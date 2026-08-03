import { Router } from "express";
import * as validatesController from "./validates.controller";
import { validate } from "../../middleware/validate";
import {
    createValidateSchema,
    updateValidateSchema,
} from "./validates.schema";

const validatesRouter = Router();

validatesRouter.get("/", validatesController.getValidates);
validatesRouter.get("/:id", validatesController.getValidate);
validatesRouter.post("/", validate(createValidateSchema), validatesController.createValidate);
validatesRouter.patch("/:id", validate(updateValidateSchema), validatesController.updateValidate);
validatesRouter.delete("/:id", validatesController.deleteValidate);

export { validatesRouter };