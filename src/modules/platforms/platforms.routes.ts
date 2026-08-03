import { Router } from "express";
import * as platformsController from "./platforms.controller";
import { validate } from "../../middleware/validate";
import {
    createPlatformSchema,
    updatePlatformSchema,
} from "./platforms.schema";

const platformsRouter = Router();

platformsRouter.get("/", platformsController.getPlatforms);
platformsRouter.get("/:id", platformsController.getPlatform);
platformsRouter.post("/", validate(createPlatformSchema), platformsController.createPlatform);
platformsRouter.patch("/:id", validate(updatePlatformSchema), platformsController.updatePlatform);
platformsRouter.delete("/:id", platformsController.deletePlatform);

export { platformsRouter };