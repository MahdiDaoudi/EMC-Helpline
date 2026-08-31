import { Request, Response } from "express";
import * as organizationsService from "./organizations.service";
import { CreateOrganizationDto, UpdateOrganizationDto } from "./organizations.schema";
import { uploadOrganizationLogo } from "../../services/supabaseStorage.service";

export async function getOrganizations(req: Request, res: Response) {
  const result = await organizationsService.getAllOrganizations();
  res.json(result);
}

export async function getOrganization(req: Request<{ id: string }>, res: Response) {
  const result = await organizationsService.getOrganizationById(Number(req.params.id));
  res.json(result);
}

export async function createOrganization(
  req: Request<{}, {}, CreateOrganizationDto>,
  res: Response
) {
  const data = { ...req.body };
  if ((req as any).file) {
    const uploadResult = await uploadOrganizationLogo((req as any).file);
    data.image = uploadResult.persistedReference ?? uploadResult.imageUrl;
  }

  const result = await organizationsService.addOrganization(data);
  res.status(201).json(result);
}

export async function updateOrganization(
  req: Request<{ id: string }, {}, UpdateOrganizationDto>,
  res: Response
) {
  const data = { ...req.body };
  if ((req as any).file) {
    const uploadResult = await uploadOrganizationLogo((req as any).file);
    data.image = uploadResult.persistedReference ?? uploadResult.imageUrl;
  }

  const result = await organizationsService.updateOrganization(Number(req.params.id), data);
  res.json(result);
}

export async function deleteOrganization(
  req: Request<{ id: string }>,
  res: Response
) {
  await organizationsService.deleteOrganization(Number(req.params.id));
  res.status(204).send();
}