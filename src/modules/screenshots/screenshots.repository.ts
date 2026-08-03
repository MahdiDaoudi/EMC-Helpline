import { prisma } from "../../config/prisma";
import { CreateScreenshotDto, UpdateScreenshotDto } from "./screenshots.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: CreateScreenshotDto) {}

export function update(id: number, data: UpdateScreenshotDto) {}

export function deleteById(id: number) {}