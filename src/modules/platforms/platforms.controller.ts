
import { Request, Response } from "express";
import * as platformsService from "./platforms.service";
import { CreatePlatformDto, UpdatePlatformDto } from "./platforms.schema";

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
    res: Response
) {
    const result = await platformsService.addPlatform(req.body);
    res.status(201).json(result);
}

export async function updatePlatform(
    req: Request<{ id: string }, {}, UpdatePlatformDto>,
    res: Response
) {
    const result = await platformsService.updatePlatform(Number(req.params.id), req.body);
    res.json(result);
}

export async function deletePlatform(
    req: Request<{ id: string }>,
    res: Response
) {
    await platformsService.deletePlatform(Number(req.params.id));
    res.status(204).send();
}