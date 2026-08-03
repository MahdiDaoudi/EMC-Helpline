import { prisma } from "../../config/prisma";
import { CreatePlatformDto, UpdatePlatformDto } from "./platforms.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: CreatePlatformDto) {}

export function update(id: number, data: UpdatePlatformDto) {}

export function deleteById(id: number) {}