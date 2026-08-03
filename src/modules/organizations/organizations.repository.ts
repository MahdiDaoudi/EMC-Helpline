import { prisma } from "../../config/prisma";
import { CreateOrganizationDto, UpdateOrganizationDto } from "./organizations.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: CreateOrganizationDto) {}

export function update(id: number, data: UpdateOrganizationDto) {}

export function deleteById(id: number) {}