import { Router } from "express";
import * as platformReportsController from "./platformReports.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import {
  createPlatformReportSchema,
  updatePlatformReportSchema,
} from "./platformReports.schema";

const platformsReportsRouter = Router();

platformsReportsRouter.get(
  "/",
  authenticate(),
  platformReportsController.getPlatformReports,
);
platformsReportsRouter.get(
  "/:signalementId/:platformId",
  authenticate(),
  platformReportsController.getPlatformReport,
);
platformsReportsRouter.post(
  "/",
  authenticate(),
  validate(createPlatformReportSchema),
  platformReportsController.createPlatformReport,
);
platformsReportsRouter.patch(
  "/:signalementId/:platformId",
  authenticate(),
  validate(updatePlatformReportSchema),
  platformReportsController.updatePlatformReport,
);
platformsReportsRouter.delete(
  "/:signalementId/:platformId",
  authenticate(),
  platformReportsController.deletePlatformReport,
);

export { platformsReportsRouter };
