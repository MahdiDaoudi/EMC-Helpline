import { Router } from "express";
import * as userController from "./users.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { RoleName } from "../../generated/prisma/enums";
import { validate } from "../../middleware/validate";
import { createUserSchema, updateUserSchema } from "./users.schema";

export const userRouter = Router();

userRouter.use(authenticate());
userRouter.use(authorize(RoleName.SUPER_ADMIN));

userRouter.get("/", userController.getUsers);
userRouter.get("/:id", userController.getUser);
userRouter.post(
  "/",
  validate(createUserSchema),
  userController.createUser,
);
userRouter.patch(
  "/:id",
  validate(updateUserSchema),
  userController.updateUser,
);
userRouter.delete("/:id", userController.deleteUser);
