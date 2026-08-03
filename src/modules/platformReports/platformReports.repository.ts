import { prisma } from "../../config/prisma";
import { CreatePlatformReportDto, UpdatePlatformReportDto } from "./platformReports.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: CreatePlatformReportDto) {}

export function update(id: number, data: UpdatePlatformReportDto) {}

export function deleteById(id: number) {}