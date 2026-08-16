import { Router } from "express";
import * as validatesController from "./validates.controller";
import { validate } from "../../middleware/validate";
import { createValidateSchema, updateValidateSchema } from "./validates.schema";

const validatesRouter = Router();

validatesRouter.get("/", validatesController.getValidates);
validatesRouter.get("/:signalementId/:userId", validatesController.getValidate);
validatesRouter.post(
  "/",
  validate(createValidateSchema),
  validatesController.createValidate,
);
validatesRouter.patch(
  "/:signalementId/:userId",
  validate(updateValidateSchema),
  validatesController.updateValidate,
);
validatesRouter.delete(
  "/:signalementId/:userId",
  validatesController.deleteValidate,
);

export { validatesRouter };
