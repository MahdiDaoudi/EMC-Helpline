
import { Request, Response } from "express";
import * as screenshotsService from "./screenshots.service";
import { CreateScreenshotDto, UpdateScreenshotDto } from "./screenshots.schema";

export async function getScreenshots(req: Request, res: Response) {
    const result = await screenshotsService.getAllScreenshots();
    res.json(result);
}

export async function getScreenshot(req: Request<{ id: string }>, res: Response) {
    const result = await screenshotsService.getScreenshotById(Number(req.params.id));
    res.json(result);
}

export async function createScreenshot(
    req: Request<{}, {}, CreateScreenshotDto>,
    res: Response
) {
    const result = await screenshotsService.addScreenshot(req.body);
    res.status(201).json(result);
}

export async function updateScreenshot(
    req: Request<{ id: string }, {}, UpdateScreenshotDto>,
    res: Response
) {
    const result = await screenshotsService.updateScreenshot(Number(req.params.id), req.body);
    res.json(result);
}

export async function deleteScreenshot(
    req: Request<{ id: string }>,
    res: Response
) {
    await screenshotsService.deleteScreenshot(Number(req.params.id));
    res.status(204).send();
}