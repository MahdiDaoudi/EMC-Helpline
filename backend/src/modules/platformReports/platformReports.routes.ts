import { Router } from "express";
import * as platformReportsController from "./platformReports.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import {
  createPlatformReportSchema,
  updatePlatformReportSchema,
} from "./platformReports.schema";

import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";

const platformsReportsRouter = Router();

platformsReportsRouter.use(authenticate());
platformsReportsRouter.use(authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.TECHNICIAN));

platformsReportsRouter.get(
  "/",
  platformReportsController.getPlatformReports,
);
platformsReportsRouter.get(
  "/:signalementId/:platformId",
  platformReportsController.getPlatformReport,
);
platformsReportsRouter.post(
  "/",
  validate(createPlatformReportSchema),
  platformReportsController.createPlatformReport,
);
platformsReportsRouter.patch(
  "/:signalementId/:platformId",
  validate(updatePlatformReportSchema),
  platformReportsController.updatePlatformReport,
);
platformsReportsRouter.delete(
  "/:signalementId/:platformId",
  platformReportsController.deletePlatformReport,
);

export { platformsReportsRouter };
