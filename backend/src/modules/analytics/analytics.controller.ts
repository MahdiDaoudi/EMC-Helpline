import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";

import { RoleName } from "../../generated/prisma/enums";

export async function getAnalytics(req: Request, res: Response) {
  const isOrgUser = req.user.role === RoleName.ORGANIZATION_USER;
  const organizationId = isOrgUser
    ? (req.user.organizationId ?? -1)
    : req.query.organizationId
    ? Number(req.query.organizationId)
    : undefined;

  const result = await analyticsService.getAnalyticsDashboard({
    period: typeof req.query.period === "string" ? (req.query.period as any) : undefined,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
    status: typeof req.query.status === "string" ? (req.query.status as any) : undefined,
    priority: typeof req.query.priority === "string" ? (req.query.priority as any) : undefined,
    cyberViolenceId: req.query.cyberViolenceId ? Number(req.query.cyberViolenceId) : undefined,
    platformId: req.query.platformId ? Number(req.query.platformId) : undefined,
    organizationId,
    titulaire: typeof req.query.titulaire === "string" ? (req.query.titulaire as any) : undefined,
    accompanimentType: typeof req.query.accompanimentType === "string" ? (req.query.accompanimentType as any) : undefined,
  });

  res.json(result);
}
