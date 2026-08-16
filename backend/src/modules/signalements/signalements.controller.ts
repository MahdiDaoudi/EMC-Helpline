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
  });
  res.json(result);
}

export async function getSignalement(
  req: Request<{ id: string }>,
  res: Response,
) {
  const result = await signalementsService.getSignalementById(req.params.id);
  res.json(result);
}

export async function createSignalement(
  req: Request<{}, {}, CreateSignalementDto>,
  res: Response,
) {
  const requestStart = Date.now();
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  console.log("========== PERFORMANCE TRACE START ==========");
  console.log("REQUEST START");
  console.log(
    "MULTER FILES:",
    files.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })),
  );

  try {
    console.log("[PERF] BEFORE SERVICE:", Date.now() - requestStart, "ms");

    const result = await signalementsService.addSignalement(
      req.body,
      req.user.userId,
      files,
    );

    console.log("[PERF] AFTER SERVICE:", Date.now() - requestStart, "ms");
    console.log("CREATED SIGNALMENT ID:", result?.id);
    console.log("[PERF] BEFORE RESPONSE:", Date.now() - requestStart, "ms");

    const response = res.status(201).json(result);
    console.log("[PERF] TOTAL REQUEST:", Date.now() - requestStart, "ms");
    return response;
  } catch (error) {
    console.error("SIGNALMENT CREATE ERROR:", error);

    return res.status(500).json({
      message: "Failed to create signalement",
    });
  } finally {
    console.log("========== PERFORMANCE TRACE END ==========");
  }
}

export async function updateSignalement(
  req: Request<{ id: string }, {}, UpdateSignalementDto>,
  res: Response,
) {
  const result = await signalementsService.updateSignalement(
    req.params.id,
    req.body,
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
