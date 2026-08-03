import { prisma } from "../../config/prisma";
import { CreateValidateDto, UpdateValidateDto } from "./validates.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: CreateValidateDto) {}

export function update(id: number, data: UpdateValidateDto) {}

export function deleteById(id: number) {}