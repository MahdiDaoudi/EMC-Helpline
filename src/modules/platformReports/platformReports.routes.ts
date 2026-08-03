import { Router } from "express";
import * as platformReportsController from "./platformReports.controller";
import { validate } from "../../middleware/validate";
import {
    createPlatformReportSchema,
    updatePlatformReportSchema,
} from "./platformReports.schema";

const platformReportsRouter = Router();

platformReportsRouter.get("/", platformReportsController.getPlatformReports);
platformReportsRouter.get("/:id", platformReportsController.getPlatformReport);
platformReportsRouter.post("/", validate(createPlatformReportSchema), platformReportsController.createPlatformReport);
platformReportsRouter.patch("/:id", validate(updatePlatformReportSchema), platformReportsController.updatePlatformReport);
platformReportsRouter.delete("/:id", platformReportsController.deletePlatformReport);

export { platformReportsRouter };