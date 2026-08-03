import { Router } from "express";
import * as screenshotsController from "./screenshots.controller";
import { validate } from "../../middleware/validate";
import {
    createScreenshotSchema,
    updateScreenshotSchema,
} from "./screenshots.schema";

const screenshotsRouter = Router();

screenshotsRouter.get("/", screenshotsController.getScreenshots);
screenshotsRouter.get("/:id", screenshotsController.getScreenshot);
screenshotsRouter.post("/", validate(createScreenshotSchema), screenshotsController.createScreenshot);
screenshotsRouter.patch("/:id", validate(updateScreenshotSchema), screenshotsController.updateScreenshot);
screenshotsRouter.delete("/:id", screenshotsController.deleteScreenshot);

export { screenshotsRouter };