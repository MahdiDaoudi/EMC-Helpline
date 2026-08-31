import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

import { authenticate } from "../../middleware/authenticate";

const dashboardRouter = Router();

dashboardRouter.use(authenticate());

dashboardRouter.get("/stats", dashboardController.getDashboardStats);
dashboardRouter.get("/timeseries", dashboardController.getTimeSeriesData);
dashboardRouter.get("/activity", dashboardController.getRecentActivity);
dashboardRouter.get("/recent", dashboardController.getRecentSignalements);

export { dashboardRouter };
