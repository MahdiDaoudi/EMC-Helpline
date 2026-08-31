import { Router } from "express";
import * as victimsController from "./victims.controller";
import { validate } from "../../middleware/validate";
import {updateVictimSchema } from "./victims.schema";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";

const victimsRouter = Router();

victimsRouter.use(authenticate());
victimsRouter.use(authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.TECHNICIAN));

victimsRouter.get("/", victimsController.getvictims);
victimsRouter.get("/:id", victimsController.getvictim);
victimsRouter.patch(
  "/:id",
  validate(updateVictimSchema),
  victimsController.updatevictim,
);
victimsRouter.delete("/:id", victimsController.deletevictim);

export { victimsRouter };
