import { Router } from "express";
import * as roleController from "./roles.controller";
import { validate } from "../../middleware/validate";
import { createRoleSchema, updateRoleSchema } from "./roles.schema";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";

export const roleRouter = Router();

roleRouter.use(authenticate());
roleRouter.use(authorize(RoleName.SUPER_ADMIN));

roleRouter.get("/", roleController.getRoles);
roleRouter.get("/:id", roleController.getRole);
roleRouter.post("/", validate(createRoleSchema), roleController.createRole);
roleRouter.patch("/:id", validate(updateRoleSchema), roleController.updateRole);
roleRouter.delete("/:id", roleController.deleteRole);
