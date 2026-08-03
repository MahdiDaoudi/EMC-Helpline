
import { Request, Response } from "express";
import * as reportedItemsService from "./reportedItems.service";
import { CreateReportedItemDto, UpdateReportedItemDto } from "./reportedItems.schema";

export async function getReportedItems(req: Request, res: Response) {
    const result = await reportedItemsService.getAllReportedItems();
    res.json(result);
}

export async function getReportedItem(req: Request<{ id: string }>, res: Response) {
    const result = await reportedItemsService.getReportedItemById(Number(req.params.id));
    res.json(result);
}

export async function createReportedItem(
    req: Request<{}, {}, CreateReportedItemDto>,
    res: Response
) {
    const result = await reportedItemsService.addReportedItem(req.body);
    res.status(201).json(result);
}

export async function updateReportedItem(
    req: Request<{ id: string }, {}, UpdateReportedItemDto>,
    res: Response
) {
    const result = await reportedItemsService.updateReportedItem(Number(req.params.id), req.body);
    res.json(result);
}

export async function deleteReportedItem(
    req: Request<{ id: string }>,
    res: Response
) {
    await reportedItemsService.deleteReportedItem(Number(req.params.id));
    res.status(204).send();
}