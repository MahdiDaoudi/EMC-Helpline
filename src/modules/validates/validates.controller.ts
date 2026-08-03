
import { Request, Response } from "express";
import * as validatesService from "./validates.service";
import { CreateValidateDto, UpdateValidateDto } from "./validates.schema";

export async function getValidates(req: Request, res: Response) {
    const result = await validatesService.getAllValidates();
    res.json(result);
}

export async function getValidate(req: Request<{ id: string }>, res: Response) {
    const result = await validatesService.getValidateById(Number(req.params.id));
    res.json(result);
}

export async function createValidate(
    req: Request<{}, {}, CreateValidateDto>,
    res: Response
) {
    const result = await validatesService.addValidate(req.body);
    res.status(201).json(result);
}

export async function updateValidate(
    req: Request<{ id: string }, {}, UpdateValidateDto>,
    res: Response
) {
    const result = await validatesService.updateValidate(Number(req.params.id), req.body);
    res.json(result);
}

export async function deleteValidate(
    req: Request<{ id: string }>,
    res: Response
) {
    await validatesService.deleteValidate(Number(req.params.id));
    res.status(204).send();
}