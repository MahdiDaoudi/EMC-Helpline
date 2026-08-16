import { Router } from "express";
import * as signalementsController from "./signalements.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { upload } from "../../middleware/upload.middleware";
import {
  createSignalementSchema,
  updateSignalementSchema,
} from "./signalements.schema";

const signalementsRouter = Router();

signalementsRouter.get("/", signalementsController.getSignalements);
signalementsRouter.get("/:id", signalementsController.getSignalement);
signalementsRouter.post(
  "/",
  authenticate(),
  upload.any(),
  validate(createSignalementSchema),
  signalementsController.createSignalement,
);
signalementsRouter.patch(
  "/:id",
  validate(updateSignalementSchema),
  signalementsController.updateSignalement,
);
signalementsRouter.delete("/:id", signalementsController.deleteSignalement);

export { signalementsRouter };
