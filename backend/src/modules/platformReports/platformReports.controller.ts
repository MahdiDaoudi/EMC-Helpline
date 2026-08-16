import { Request, Response } from "express";
import * as platformReportsService from "./platformReports.service";
import {
  CreatePlatformReportDto,
  UpdatePlatformReportDto,
} from "./platformReports.schema";

export async function getPlatformReports(req: Request, res: Response) {
  const result = await platformReportsService.getAllPlatformReports();
  res.json(result);
}

export async function getPlatformReport(
  req: Request<{ signalementId: string; platformId: string }>,
  res: Response,
) {
  const result = await platformReportsService.getPlatformReportById(
    Number(req.params.signalementId),
    Number(req.params.platformId),
  );
  res.json(result);
}

export async function createPlatformReport(
  req: Request<{}, {}, CreatePlatformReportDto>,
  res: Response,
) {
  const result = await platformReportsService.addPlatformReport(req.body);
  res.status(201).json(result);
}

export async function updatePlatformReport(
  req: Request<
    { signalementId: string; platformId: string },
    {},
    UpdatePlatformReportDto
  >,
  res: Response,
) {
  const result = await platformReportsService.updatePlatformReport(
    req.body,
    Number(req.params.signalementId),
    Number(req.params.platformId),
  );
  res.json(result);
}

export async function deletePlatformReport(
  req: Request<{ signalementId: string; platformId: string }>,
  res: Response,
) {
  await platformReportsService.deletePlatformReport(
    Number(req.params.signalementId),
    Number(req.params.platformId),
  );
  res.status(204).send();
}
