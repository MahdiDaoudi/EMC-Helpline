import { Router } from "express";
import * as reportedItemsController from "./reportedItems.controller";
import { validate } from "../../middleware/validate";
import {
    createReportedItemSchema,
    updateReportedItemSchema,
} from "./reportedItems.schema";

const reportedItemsRouter = Router();

reportedItemsRouter.get("/", reportedItemsController.getReportedItems);
reportedItemsRouter.get("/:id", reportedItemsController.getReportedItem);
reportedItemsRouter.post("/", validate(createReportedItemSchema), reportedItemsController.createReportedItem);
reportedItemsRouter.patch("/:id", validate(updateReportedItemSchema), reportedItemsController.updateReportedItem);
reportedItemsRouter.delete("/:id", reportedItemsController.deleteReportedItem);

export { reportedItemsRouter };