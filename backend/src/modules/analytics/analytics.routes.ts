import { Router } from "express";
import * as analyticsController from "./analytics.controller";
import { authenticate } from "../../middleware/authenticate";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate());
analyticsRouter.get("/", analyticsController.getAnalytics);
