import { Request, Response } from "express";
import * as signalementsService from "./signalements.service";
import {
  CreateSignalementDto,
  UpdateSignalementDto,
} from "./signalements.schema";

export async function getSignalements(req: Request, res: Response) {
  const result = await signalementsService.getAllSignalements({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    priority:
      typeof req.query.priority === "string" ? req.query.priority : undefined,
    titulaire:
      typeof req.query.titulaire === "string" ? req.query.titulaire : undefined,
    cyberViolenceId: req.query.cyberViolenceId
      ? Number(req.query.cyberViolenceId)
      : undefined,
    accompanimentType:
      typeof req.query.accompanimentType === "string"
        ? req.query.accompanimentType
        : undefined,
    issuer: typeof req.query.issuer === "string" ? req.query.issuer : undefined,
    dateFrom:
      typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  }, req.user);
  res.json(result);
}

export async function getSignalement(
  req: Request<{ id: string }>,
  res: Response,
) {
  const result = await signalementsService.getSignalementById(req.params.id, req.user);
  res.json(result);
}

export async function createSignalement(
  req: Request<{}, {}, CreateSignalementDto>,
  res: Response,
) {
  const requestStart = Date.now();
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  try {

    const result = await signalementsService.addSignalement(
      req.body,
      req.user.userId,
      files,
    );


    const response = res.status(201).json(result);
    return response;
  } catch (error: any) {
    console.error("SIGNALMENT CREATE ERROR:", error);

    return res.status(error?.statusCode || 500).json({
      message: error?.message || "Failed to create signalement",
    });
  } finally {
  }
}

export async function createPublicSignalement(
  req: Request<{}, {}, CreateSignalementDto>,
  res: Response,
) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  try {
    const result = await signalementsService.addPublicSignalement(
      req.body,
      files,
    );
    return res.status(201).json(result);
  } catch (error: any) {
    console.error("PUBLIC SIGNALMENT CREATE ERROR:", error);
    return res.status(error?.statusCode || 500).json({
      message: error?.message || "Failed to create public signalement",
    });
  }
}

export async function updateSignalement(
  req: Request<{ id: string }, {}, UpdateSignalementDto>,
  res: Response,
) {
  const userId = (req as any).user?.userId;
  const result = await signalementsService.updateSignalement(
    req.params.id,
    req.body,
    userId,
  );
  res.json(result);
}

export async function deleteSignalement(
  req: Request<{ id: string }>,
  res: Response,
) {
  await signalementsService.deleteSignalement(req.params.id);
  res.status(204).send();
}
