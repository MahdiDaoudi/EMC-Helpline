
import { Request, Response } from "express";
import * as cyberViolencesService from "./cyberViolences.service";
import { CreateCyberViolenceDto, UpdateCyberViolenceDto } from "./cyberViolences.schema";

export async function getCyberViolences(req: Request, res: Response) {
    const result = await cyberViolencesService.getAllCyberViolences();
    res.json(result);
}

export async function getCyberViolence(req: Request<{ id: string }>, res: Response) {
    const result = await cyberViolencesService.getCyberViolenceById(Number(req.params.id));
    res.json(result);
}

export async function createCyberViolence(
    req: Request<{}, {}, CreateCyberViolenceDto>,
    res: Response
) {
    const result = await cyberViolencesService.addCyberViolence(req.body);
    res.status(201).json(result);
}

export async function updateCyberViolence(
    req: Request<{ id: string }, {}, UpdateCyberViolenceDto>,
    res: Response
) {
    const result = await cyberViolencesService.updateCyberViolence(Number(req.params.id), req.body);
    res.json(result);
}

export async function deleteCyberViolence(
    req: Request<{ id: string }>,
    res: Response
) {
    await cyberViolencesService.deleteCyberViolence(Number(req.params.id));
    res.status(204).send();
}