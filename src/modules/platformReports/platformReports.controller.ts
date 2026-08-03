
import { Request, Response } from "express";
import * as platformReportsService from "./platformReports.service";
import { CreatePlatformReportDto, UpdatePlatformReportDto } from "./platformReports.schema";

export async function getPlatformReports(req: Request, res: Response) {
    const result = await platformReportsService.getAllPlatformReports();
    res.json(result);
}

export async function getPlatformReport(req: Request<{ id: string }>, res: Response) {
    const result = await platformReportsService.getPlatformReportById(Number(req.params.id));
    res.json(result);
}

export async function createPlatformReport(
    req: Request<{}, {}, CreatePlatformReportDto>,
    res: Response
) {
    const result = await platformReportsService.addPlatformReport(req.body);
    res.status(201).json(result);
}

export async function updatePlatformReport(
    req: Request<{ id: string }, {}, UpdatePlatformReportDto>,
    res: Response
) {
    const result = await platformReportsService.updatePlatformReport(Number(req.params.id), req.body);
    res.json(result);
}

export async function deletePlatformReport(
    req: Request<{ id: string }>,
    res: Response
) {
    await platformReportsService.deletePlatformReport(Number(req.params.id));
    res.status(204).send();
}