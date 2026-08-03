import { prisma } from "../../config/prisma";
import { CreateReportedItemDto, UpdateReportedItemDto } from "./reportedItems.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: CreateReportedItemDto) {}

export function update(id: number, data: UpdateReportedItemDto) {}

export function deleteById(id: number) {}