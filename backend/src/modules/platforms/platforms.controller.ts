import { Request, Response } from "express";
import * as platformsService from "./platforms.service";
import { CreatePlatformDto, UpdatePlatformDto } from "./platforms.schema";
import { uploadPlatformIcon } from "../../services/supabaseStorage.service";

export async function getPlatforms(req: Request, res: Response) {
  const result = await platformsService.getAllPlatforms();
  res.json(result);
}

export async function getPlatform(req: Request<{ id: string }>, res: Response) {
  const result = await platformsService.getPlatformById(Number(req.params.id));
  res.json(result);
}

export async function createPlatform(
  req: Request<{}, {}, CreatePlatformDto>,
  res: Response,
) {
  const data: any = { ...req.body };
  if ((req as any).file) {
    const uploadResult = await uploadPlatformIcon((req as any).file);
    // store a persisted reference in DB
    data.icon = uploadResult.persistedReference ?? uploadResult.imageUrl;
  }

  const result = await platformsService.addPlatform(data);
  res.status(201).json(result);
}

export async function updatePlatform(
  req: Request<{ id: string }, {}, UpdatePlatformDto>,
  res: Response,
) {
  const data: any = { ...req.body };
  if ((req as any).file) {
    const uploadResult = await uploadPlatformIcon((req as any).file);
    data.icon = uploadResult.persistedReference ?? uploadResult.imageUrl;
  }

  const result = await platformsService.updatePlatform(
    Number(req.params.id),
    data,
  );
  res.json(result);
}

export async function deletePlatform(
  req: Request<{ id: string }>,
  res: Response,
) {
  await platformsService.deletePlatform(Number(req.params.id));
  res.status(204).send();
}
