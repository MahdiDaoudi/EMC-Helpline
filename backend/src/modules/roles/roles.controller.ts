import { Request, Response } from "express";
import * as roleService from "./roles.service";
import { CreateRoleDto, UpdateRoleDto } from "./roles.schema";

export async function getRoles(req: Request, res: Response) {
  const roles = await roleService.getAllRoles();
  res.json(roles);
}

export async function getRole(req: Request<{ id: string }>, res: Response) {
  const role = await roleService.getRoleById(Number(req.params.id));
  res.json(role);
}

export async function createRole(
  req: Request<{}, {}, CreateRoleDto>,
  res: Response,
) {
  const result = await roleService.addRole(req.body);
  res.status(201).json(result);
}

export async function updateRole(
  req: Request<{ id: string }, {}, UpdateRoleDto>,
  res: Response,
) {
  const role = await roleService.updateRole(Number(req.params.id), req.body);
  res.json(role);
}

export async function deleteRole(req: Request<{ id: string }>, res: Response) {
  await roleService.deleteRole(Number(req.params.id));
  res.status(204).send();
}
