import { Router } from "express";
import * as victimsController from "./victims.controller";
import { validate } from "../../middleware/validate";
import {updateVictimSchema } from "./victims.schema";

const victimsRouter = Router();

victimsRouter.get("/", victimsController.getvictims);
victimsRouter.get("/:id", victimsController.getvictim);
victimsRouter.patch(
  "/:id",
  validate(updateVictimSchema),
  victimsController.updatevictim,
);
victimsRouter.delete("/:id", victimsController.deletevictim);

export { victimsRouter };
