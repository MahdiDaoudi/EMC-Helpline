import { Router } from "express";
import * as roleController from "./roles.controller";
import { validate } from "../../middleware/validate";
import { createRoleSchema, updateRoleSchema } from "./roles.schema";
export const roleRouter = Router();

/**
 * @openapi
 * /roles:
 *   get:
 *     summary: Get all roles
 *     responses:
 *       200:
 *         description: List of roles
 */
roleRouter.get("/", roleController.getRoles);
roleRouter.get("/:id", roleController.getRole);
roleRouter.post("/", validate(createRoleSchema), roleController.createRole);
roleRouter.patch("/:id", validate(updateRoleSchema), roleController.updateRole);
roleRouter.delete("/:id", roleController.deleteRole);
