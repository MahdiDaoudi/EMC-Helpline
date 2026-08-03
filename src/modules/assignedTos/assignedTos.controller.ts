
import { Request, Response } from "express";
import * as assignedTosService from "./assignedTos.service";
import { CreateAssignedToDto, UpdateAssignedToDto } from "./assignedTos.schema";

export async function getAssignedTos(req: Request, res: Response) {
    const result = await assignedTosService.getAllAssignedTos();
    res.json(result);
}

export async function getAssignedTo(req: Request<{ id: string }>, res: Response) {
    const result = await assignedTosService.getAssignedToById(Number(req.params.id));
    res.json(result);
}

export async function createAssignedTo(
    req: Request<{}, {}, CreateAssignedToDto>,
    res: Response
) {
    const result = await assignedTosService.addAssignedTo(req.body);
    res.status(201).json(result);
}

export async function updateAssignedTo(
    req: Request<{ id: string }, {}, UpdateAssignedToDto>,
    res: Response
) {
    const result = await assignedTosService.updateAssignedTo(Number(req.params.id), req.body);
    res.json(result);
}

export async function deleteAssignedTo(
    req: Request<{ id: string }>,
    res: Response
) {
    await assignedTosService.deleteAssignedTo(Number(req.params.id));
    res.status(204).send();
}