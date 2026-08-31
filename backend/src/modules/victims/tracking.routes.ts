import { Router } from "express";
import * as trackingController from "./tracking.controller";
import { authenticateVictim } from "../../middleware/authenticateVictim";
import { upload } from "../../middleware/upload.middleware";
import { validate } from "../../middleware/validate";
import { createSignalementSchema } from "../signalements/signalements.schema";

const victimTrackingRouter = Router();

// Public routes for victim tracking
victimTrackingRouter.post("/access", trackingController.accessTracking);
victimTrackingRouter.post("/logout", trackingController.logoutTracking);

// Protected routes requiring victim authentication token
victimTrackingRouter.use(authenticateVictim());

victimTrackingRouter.get("/signalements", trackingController.getVictimSignalements);
victimTrackingRouter.get("/signalements/:id", trackingController.getVictimSignalementById);
victimTrackingRouter.post(
  "/signalements",
  upload.any(),
  validate(createSignalementSchema),
  trackingController.createVictimSignalement,
);

export { victimTrackingRouter };
