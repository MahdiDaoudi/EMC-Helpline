import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/stats", dashboardController.getDashboardStats);
dashboardRouter.get("/timeseries", dashboardController.getTimeSeriesData);
dashboardRouter.get("/activity", dashboardController.getRecentActivity);
dashboardRouter.get("/recent", dashboardController.getRecentSignalements);

export { dashboardRouter };
