import { prisma } from "../../config/prisma";
import { CreateCyberViolenceDto, UpdateCyberViolenceDto } from "./cyberViolences.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: CreateCyberViolenceDto) {}

export function update(id: number, data: UpdateCyberViolenceDto) {}

export function deleteById(id: number) {}