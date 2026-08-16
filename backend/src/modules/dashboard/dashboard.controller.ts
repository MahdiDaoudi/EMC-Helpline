import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export async function getDashboardStats(req: Request, res: Response) {
  const result = await dashboardService.getDashboardStats();
  res.json(result);
}

export async function getTimeSeriesData(req: Request, res: Response) {
  const range = typeof req.query.range === "string" ? req.query.range : "30d";
  const result = await dashboardService.getTimeSeriesData(range);
  res.json(result);
}

export async function getRecentSignalements(req: Request, res: Response) {
  const result = await dashboardService.getRecentSignalements();
  res.json(result);
}

export async function getRecentActivity(req: Request, res: Response) {
  const result = await dashboardService.getRecentActivity();
  res.json(result);
}
