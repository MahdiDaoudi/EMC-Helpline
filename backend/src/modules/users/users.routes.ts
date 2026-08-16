import { Router } from "express";
import * as userController from "./users.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";
import { validate } from "../../middleware/validate";
import { createUserSchema, updateUserSchema } from "./users.schema";

export const userRouter = Router();

userRouter.use(authenticate());
userRouter.get(
  "/",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TECHNICIAN),
  userController.getUsers,
);
userRouter.get(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TECHNICIAN),
  userController.getUser,
);
userRouter.post(
  "/",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  validate(createUserSchema),
  userController.createUser,
);
userRouter.patch(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  validate(updateUserSchema),
  userController.updateUser,
);
userRouter.delete(
  "/:id",
  authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN),
  userController.deleteUser,
);
