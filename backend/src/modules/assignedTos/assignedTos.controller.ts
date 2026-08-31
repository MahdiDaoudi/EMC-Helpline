import { Request, Response } from "express";
import * as assignedTosService from "./assignedTos.service";
import { UpdateAssignedToDto } from "./assignedTos.schema";

import { RoleName } from "../../generated/prisma/enums";
import { ApiError } from "../../utils/ApiError";

export async function getAssignedTos(req: Request, res: Response) {
  const isOrgUser = req.user.role === RoleName.ORGANIZATION_USER;
  const organizationId = isOrgUser
    ? (req.user.organizationId ?? -1)
    : req.query.organizationId
    ? Number(req.query.organizationId)
    : undefined;

  const result = await assignedTosService.getAllAssignedTos({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    organizationId,
    type: typeof req.query.type === "string" ? (req.query.type as any) : undefined,
    status: typeof req.query.status === "string" ? (req.query.status as any) : undefined,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  });
  res.json(result);
}

export async function getAssignedTo(
  req: Request<{ signalementId: string; organizationId: string }>,
  res: Response,
) {
  const isOrgUser = req.user.role === RoleName.ORGANIZATION_USER;
  const targetOrgId = Number(req.params.organizationId);

  if (isOrgUser && req.user.organizationId !== targetOrgId) {
    throw new ApiError(403, "Accès refusé à l'affectation d'une autre organisation.");
  }

  const result = await assignedTosService.getAssignedToById(
    Number(req.params.signalementId),
    targetOrgId,
  );
  res.json(result);
}

export async function createAssignedTo(
  req: Request<
    {},
    {},
    {
      signalementId: number;
      organizationId: number;
      type?: string;
      status?: string;
      reason?: string;
    }
  >,
  res: Response,
) {
  const result = await assignedTosService.addAssignedTo(
    Number(req.body.signalementId),
    Number(req.body.organizationId),
    req.body.type as any,
    req.body.reason,
  );

  if (req.body.reason || req.body.status) {
    const updated = await assignedTosService.updateAssignedTo(
      {
        status: req.body.status as any,
        reason: req.body.reason,
      },
      Number(req.body.signalementId),
      Number(req.body.organizationId),
    );
    res.status(201).json(updated);
    return;
  }

  res.status(201).json(result);
}

export async function updateAssignedTo(
  req: Request<
    { signalementId: string; organizationId: string },
    {},
    UpdateAssignedToDto
  >,
  res: Response,
) {
  const isOrgUser = req.user.role === RoleName.ORGANIZATION_USER;
  const targetOrgId = Number(req.params.organizationId);

  if (isOrgUser && req.user.organizationId !== targetOrgId) {
    throw new ApiError(403, "Seule l'organisation concernée peut modifier son dossier de traitement.");
  }

  const result = await assignedTosService.updateAssignedTo(
    req.body,
    Number(req.params.signalementId),
    targetOrgId,
  );
  res.json(result);
}

export async function deleteAssignedTo(
  req: Request<{ signalementId: string; organizationId: string }>,
  res: Response,
) {
  await assignedTosService.deleteAssignedTo(
    Number(req.params.signalementId),
    Number(req.params.organizationId),
  );
  res.status(204).send();
}
